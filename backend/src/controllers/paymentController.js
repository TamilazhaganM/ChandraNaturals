import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import razorpayService from '../services/razorpayService.js';
import notificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { ERROR_CODES, PAYMENT_STATUS, ORDER_STATUS } from '../config/constants.js';

/**
 * Create a new Razorpay order for an existing pending order
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Order ID is required to initiate payment.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found.',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'This order has already been paid for.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // Call Razorpay API with server verified total
    const razorpayOrder = await razorpayService.createOrder({
      amount: order.total,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerPhone: order.shippingAddress.phone
      }
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        razorpayOrderId: razorpayOrder.id,
        amount: order.total,
        amountInPaise: razorpayOrder.amount,
        currency: 'INR',
        status: PAYMENT_STATUS.CREATED,
        order: order._id,
        user: req.user._id
      },
      { upsert: true, new: true }
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'Razorpay order created successfully',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayOrder.keyId,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Incomplete payment verification payload.',
        errorCode: ERROR_CODES.VALIDATION_ERROR
      });
    }

    // 1. Locate Order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Order not found.',
        errorCode: ERROR_CODES.NOT_FOUND
      });
    }

    // 2. Cryptographically verify signature using HMAC SHA256
    const isValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      console.warn(`🚨 [SECURITY ALERT] Invalid payment signature attempt on order ${order.orderNumber}`);

      // Record failed payment
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: PAYMENT_STATUS.FAILED,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      );

      return errorResponse(res, {
        statusCode: 400,
        message: 'Payment verification failed: cryptographic signature mismatch.',
        errorCode: ERROR_CODES.PAYMENT_VERIFICATION_FAILED
      });
    }

    // 3. Signature is authentic - update Order and Payment
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.orderStatus = ORDER_STATUS.CONFIRMED;
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    await order.save();

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: PAYMENT_STATUS.PAID,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      },
      { upsert: true, new: true }
    );

    // 4. Send Confirmation Notification
    notificationService.sendOrderConfirmation({
      order,
      customer: {
        name: order.shippingAddress.fullName,
        email: order.shippingAddress.email,
        phone: order.shippingAddress.phone
      }
    });

    console.log(`✅ [Payment] Order #${order.orderNumber} successfully paid (Payment ID: ${razorpay_payment_id})`);

    return successResponse(res, {
      statusCode: 200,
      message: 'Payment verified successfully. Your order is confirmed!',
      data: {
        order,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Razorpay Webhook Handler
 * Verifies signature, guarantees idempotency, updates order/payment state
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody ? req.rawBody.toString('utf-8') : JSON.stringify(req.body);

    // 1. Verify Webhook Signature
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn('🚨 [SECURITY ALERT] Invalid Razorpay webhook signature detected.');
      return res.status(400).json({ status: 'invalid_signature' });
    }

    const payload = req.body;
    const event = payload.event;
    const eventId = payload.event_id || req.headers['x-razorpay-event-id'] || `ev_${Date.now()}`;

    console.log(`🔔 [Webhook] Received Razorpay Event: ${event} (Event ID: ${eventId})`);

    // 2. Extract payment entity
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!razorpayOrderId) {
      return res.status(200).json({ status: 'ignored_no_order' });
    }

    // 3. Check for idempotency: has this event already been processed?
    const paymentRecord = await Payment.findOne({
      razorpayOrderId,
      'webhookEvents.eventId': eventId
    });

    if (paymentRecord) {
      console.log(`ℹ️  [Webhook] Event ${eventId} was already processed. Skipping to avoid duplicate.`);
      return res.status(200).json({ status: 'already_processed' });
    }

    // 4. Process event
    if (event === 'payment.captured' || event === 'order.paid') {
      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.orderStatus = ORDER_STATUS.CONFIRMED;
        order.paymentId = paymentEntity?.id || order.paymentId;
        await order.save();

        console.log(`✅ [Webhook] Marked order ${order.orderNumber} as PAID.`);
      }

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: PAYMENT_STATUS.PAID,
          razorpayPaymentId: paymentEntity?.id,
          method: paymentEntity?.method,
          $push: {
            webhookEvents: {
              eventId,
              event,
              payload: paymentEntity,
              processedAt: new Date()
            }
          }
        },
        { upsert: true }
      );
    } else if (event === 'payment.failed') {
      console.warn(`❌ [Webhook] Payment failed for Razorpay Order: ${razorpayOrderId}`);

      await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: PAYMENT_STATUS.FAILED,
          razorpayPaymentId: paymentEntity?.id,
          $push: {
            webhookEvents: {
              eventId,
              event,
              payload: paymentEntity,
              processedAt: new Date()
            }
          }
        }
      );
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
