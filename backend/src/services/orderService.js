import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import { BUSINESS_RULES, ERROR_CODES } from '../config/constants.js';

class OrderService {
  /**
   * Verify items and calculate pricing strictly on the server
   */
  async calculateOrderPricing(rawItems, couponCode = null, userId = null) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      const err = new Error('Your cart or order items cannot be empty.');
      err.statusCode = 400;
      err.errorCode = ERROR_CODES.VALIDATION_ERROR;
      throw err;
    }

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of rawItems) {
      const productId = item.productId || item.product?._id || item.product?.id || item.product;
      const quantity = Math.max(1, parseInt(item.quantity, 10));

      // Fetch current product from MongoDB
      const isObjectId = mongoose.Types.ObjectId.isValid(productId);
      const product = await Product.findOne({
        $or: [{ _id: isObjectId ? productId : null }, { slug: productId }],
        isActive: true
      });

      if (!product) {
        const err = new Error(`One of your chosen items is no longer available.`);
        err.statusCode = 404;
        err.errorCode = ERROR_CODES.PRODUCT_INACTIVE;
        throw err;
      }

      if (product.stock < quantity) {
        const err = new Error(
          `Insufficient stock for "${product.name}". Only ${product.stock} available.`
        );
        err.statusCode = 400;
        err.errorCode = ERROR_CODES.INSUFFICIENT_STOCK;
        throw err;
      }

      // Calculate server price (never trust frontend input)
      const itemPrice = product.price;
      const itemSubtotal = itemPrice * quantity;
      subtotal += itemSubtotal;

      verifiedItems.push({
        product: product._id,
        name: product.name,
        price: itemPrice,
        weight: product.weight,
        image: product.image,
        quantity,
        subtotal: itemSubtotal
      });
    }

    // Coupon calculation
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCoupon = String(couponCode).trim().toUpperCase();
      const coupon = await Coupon.findOne({
        code: cleanCoupon,
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (coupon) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          console.log(`Coupon ${cleanCoupon} usage limit reached.`);
        } else if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
          console.log(`Subtotal ₹${subtotal} below coupon min value ₹${coupon.minOrderValue}`);
        } else {
          // Calculate discount
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else if (coupon.discountType === 'fixed') {
            discount = Math.min(subtotal, coupon.discountValue);
          }
          appliedCoupon = coupon;
        }
      }
    }

    // Shipping fee calculation
    const isFreeShipping = subtotal >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD;
    const shippingFee = verifiedItems.length === 0 ? 0 : isFreeShipping ? 0 : BUSINESS_RULES.STANDARD_SHIPPING_FEE;

    const total = Math.max(0, subtotal - discount) + shippingFee;

    return {
      items: verifiedItems,
      subtotal,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      shippingFee,
      isFreeShipping,
      tax: 0, // Prices are all-inclusive
      total,
      appliedCoupon
    };
  }

  /**
   * Safely and atomically decrement stock for order items
   * Throws INSUFFICIENT_STOCK and rolls back if race condition occurs
   */
  async reserveStockSafely(verifiedItems) {
    const decrementedList = [];

    try {
      for (const item of verifiedItems) {
        const updateResult = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
            isActive: true
          },
          {
            $inc: { stock: -item.quantity }
          },
          { new: true }
        );

        if (!updateResult) {
          throw new Error(
            `Unable to reserve stock for "${item.name}". Stock might have been purchased by another customer.`
          );
        }

        // Update available flag if stock reaches 0
        if (updateResult.stock === 0) {
          await Product.findByIdAndUpdate(item.product, { available: false });
        }

        decrementedList.push({ product: item.product, quantity: item.quantity });
      }
    } catch (err) {
      console.warn('⚠️  Stock reservation failed. Rolling back previously reserved items...', err.message);
      // Rollback any items decremented before failure
      for (const rolledBack of decrementedList) {
        await Product.findByIdAndUpdate(rolledBack.product, {
          $inc: { stock: rolledBack.quantity },
          available: true
        });
      }

      const error = new Error(err.message || 'One or more items are out of stock.');
      error.statusCode = 400;
      error.errorCode = ERROR_CODES.INSUFFICIENT_STOCK;
      throw error;
    }
  }

  /**
   * Restore stock when order is cancelled or payment permanently fails
   */
  async restoreStock(orderItems) {
    if (!Array.isArray(orderItems)) return;

    for (const item of orderItems) {
      const productId = item.product?._id || item.product;
      if (productId) {
        await Product.findByIdAndUpdate(productId, {
          $inc: { stock: item.quantity },
          available: true
        });
      }
    }
    console.log(`🔄 Restored stock for ${orderItems.length} items from cancelled order.`);
  }
}

export const orderService = new OrderService();
export default orderService;
