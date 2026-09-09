import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, BUSINESS_RULES } from '../config/constants.js';

/**
 * Format cart with calculated totals
 */
const formatCartResponse = (cart) => {
  const items = (cart.items || []).filter(item => item.product && item.product.isActive);

  let subtotal = 0;
  let totalOriginalPrice = 0;
  let itemCount = 0;

  const formattedItems = items.map(item => {
    const product = item.product;
    const itemSubtotal = product.price * item.quantity;
    const itemOriginal = (product.compareAtPrice || product.price) * item.quantity;

    subtotal += itemSubtotal;
    totalOriginalPrice += itemOriginal;
    itemCount += item.quantity;

    return {
      _id: item._id,
      quantity: item.quantity,
      product: {
        id: product.slug || product._id,
        _id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.image,
        weight: product.weight,
        category: product.category,
        isVeg: product.isVeg,
        stock: product.stock,
        available: product.available && product.stock > 0
      }
    };
  });

  const totalSavings = Math.max(0, totalOriginalPrice - subtotal);
  const isFreeShipping = subtotal >= BUSINESS_RULES.FREE_SHIPPING_THRESHOLD;
  const shippingFee = formattedItems.length === 0 ? 0 : isFreeShipping ? 0 : BUSINESS_RULES.STANDARD_SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;

  return {
    items: formattedItems,
    itemCount,
    subtotal,
    totalSavings,
    shippingFee,
    isFreeShipping,
    grandTotal
  };
};

/**
 * Get authenticated customer's cart
 */
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const formatted = formatCartResponse(cart);
    return successResponse(res, {
      statusCode: 200,
      message: 'Cart fetched successfully',
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Product ID is required',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const requestedQty = Math.max(1, parseInt(quantity, 10));

    // Verify product in database
    const product = await Product.findOne({
      $or: [{ _id: productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null }, { slug: productId }],
      isActive: true
    });

    if (!product) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Product not found or is currently unavailable',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // Verify available stock
    if (product.stock < requestedQty) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Only ${product.stock} units of ${product.name} are currently available in stock`,
        errorCode: ERROR_CODES.INSUFFICIENT_STOCK
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === product._id.toString()
    );

    if (itemIndex > -1) {
      const newQuantity = cart.items[itemIndex].quantity + requestedQty;
      if (newQuantity > product.stock) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Cannot add more. You have ${cart.items[itemIndex].quantity} in cart and only ${product.stock} are available`,
          errorCode: ERROR_CODES.INSUFFICIENT_STOCK
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: requestedQty
      });
    }

    await cart.save();
    await cart.populate('items.product');

    return successResponse(res, {
      statusCode: 200,
      message: `Added ${product.name} to order`,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Cart not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // Resolve product ObjectId if itemId is a slug or subdocument ID
    let targetProductId = itemId;
    if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      const prod = await Product.findOne({ slug: itemId });
      if (prod) targetProductId = prod._id.toString();
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === itemId || item.product.toString() === targetProductId
    );

    if (itemIndex === -1) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Item not found in cart',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const product = await Product.findById(cart.items[itemIndex].product);
      if (!product || !product.isActive) {
        cart.items.splice(itemIndex, 1);
      } else if (newQty > product.stock) {
        return errorResponse(res, {
          statusCode: 400,
          message: `Requested quantity exceeds available stock (${product.stock})`,
          errorCode: ERROR_CODES.INSUFFICIENT_STOCK
        });
      } else {
        cart.items[itemIndex].quantity = newQty;
      }
    }

    await cart.save();
    await cart.populate('items.product');

    return successResponse(res, {
      statusCode: 200,
      message: 'Cart updated successfully',
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an item from cart
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Cart not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // Resolve product ObjectId if itemId is a slug
    let targetProductId = itemId;
    if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
      const prod = await Product.findOne({ slug: itemId });
      if (prod) targetProductId = prod._id.toString();
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== itemId && item.product.toString() !== targetProductId
    );

    await cart.save();
    await cart.populate('items.product');

    return successResponse(res, {
      statusCode: 200,
      message: 'Item removed from cart',
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Cart cleared successfully',
      data: { items: [], itemCount: 0, subtotal: 0, totalSavings: 0, grandTotal: 0 }
    });
  } catch (error) {
    next(error);
  }
};
