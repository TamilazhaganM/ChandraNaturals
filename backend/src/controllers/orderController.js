import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import orderService from '../services/orderService.js';
import razorpayService from '../services/razorpayService.js';
import notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../config/constants.js';

/**
 * Place a new Order
 * Flow: Authenticate -> Verify pricing -> Reserve stock atomically -> Create order -> Init Razorpay (if online) -> Clear cart
 */
export const createOrder = async (req, res, next) => {
  try {
    const {
      items: clientItems,
      shippingAddress,
      paymentMethod = PAYMENT_METHOD.RAZORPAY,
      notes = '',
      couponCode = null
    } = req.body;

    // 1. Resolve items: use passed items or fallback to customer's current cart
    let rawItems = clientItems;
    if (!rawItems || rawItems.length === 0) {
      const userCart = await Cart.findOne({ user: req.user._id });
      if (userCart && userCart.items.length > 0) {
        rawItems = userCart.items;
      }
    }

    if (!rawItems || rawItems.length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Your cart is empty. Please select products to place an order.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // 2. Validate shipping address fields
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.pincode
    ) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Complete delivery address details are required.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // Validate phone and pincode
    if (!/^[6-9]\d{9}$/.test(String(shippingAddress.phone).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please provide a valid 10-digit delivery contact number.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (!/^\d{6}$/.test(String(shippingAddress.pincode).trim())) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Please enter a valid 6-digit postal pincode.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // 3. Calculate order pricing strictly on the server
    const pricing = await orderService.calculateOrderPricing(rawItems, couponCode, req.user._id);

    // 4. Reserve stock atomically
    await orderService.reserveStockSafely(pricing.items);

    // 5. Generate Order Number & Record
    const orderNumber = Order.generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: pricing.items,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      couponCode: pricing.couponCode,
      shippingFee: pricing.shippingFee,
      tax: pricing.tax,
      total: pricing.total,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: String(shippingAddress.phone).trim(),
        email: shippingAddress.email ? shippingAddress.email.trim() : req.user.email,
        addressLine: shippingAddress.addressLine.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state ? shippingAddress.state.trim() : 'Tamil Nadu',
        pincode: String(shippingAddress.pincode).trim(),
        landmark: shippingAddress.landmark ? shippingAddress.landmark.trim() : ''
      },
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHOD.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING,
      orderStatus: paymentMethod === PAYMENT_METHOD.COD ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING,
      notes: notes.trim()
    });

    // 6. Handle Razorpay Online Payment Flow
    let razorpayOrderData = null;

    if (paymentMethod === PAYMENT_METHOD.RAZORPAY) {
      try {
        razorpayOrderData = await razorpayService.createOrder({
          amount: order.total,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            customerPhone: order.shippingAddress.phone
          }
        });

        // Update order with razorpayOrderId
        order.razorpayOrderId = razorpayOrderData.id;
        await order.save();

        // Create Payment audit record
        await Payment.create({
          razorpayOrderId: razorpayOrderData.id,
          amount: order.total,
          amountInPaise: razorpayOrderData.amount,
          currency: 'INR',
          status: PAYMENT_STATUS.CREATED,
          order: order._id,
          user: req.user._id
        });
      } catch (paymentErr) {
        console.error('❌ Failed to initiate Razorpay order:', paymentErr.message);
        // Rollback stock reservation
        await orderService.restoreStock(order.items);
        order.orderStatus = ORDER_STATUS.CANCELLED;
        order.cancellationReason = 'Payment gateway initiation failed';
        await order.save();

        return errorResponse(res, {
          statusCode: 502,
          message: 'Unable to initialize secure payment gateway. Please try again or choose Cash on Delivery.',
          errorCode: ERROR_CODES.PAYMENT_FAILED
        });
      }
    }

    // 7. Clear customer cart on successful placement
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // 8. If COD or WhatsApp, dispatch immediate order confirmation
    if (paymentMethod === PAYMENT_METHOD.COD || paymentMethod === PAYMENT_METHOD.WHATSAPP) {
      notificationService.sendOrderConfirmation({
        order,
        customer: {
          name: order.shippingAddress.fullName,
          email: order.shippingAddress.email,
          phone: order.shippingAddress.phone
        }
      });
    }

    return successResponse(res, {
      statusCode: 201,
      message: 'Order created successfully',
      data: {
        order,
        razorpayOrder: razorpayOrderData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current customer's order history
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Orders fetched successfully',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single order details
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { orderNumber: id }
      ]
    };

    // If not admin, restrict to own order
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Order details fetched successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer requested cancellation' } = req.body;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id
    });

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    if (order.orderStatus === ORDER_STATUS.SHIPPED || order.orderStatus === ORDER_STATUS.DELIVERED) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Cannot cancel an order that has already been dispatched or delivered.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    if (order.orderStatus === ORDER_STATUS.CANCELLED) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'This order is already cancelled.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    await order.save();

    // Restore reserved stock back to products
    await orderService.restoreStock(order.items);

    return successResponse(res, {
      statusCode: 200,
      message: 'Order has been successfully cancelled.',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};
