import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../config/constants.js';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    weight: String,
    image: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const shippingAddressSnapshotSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    addressLine: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      default: 'Tamil Nadu'
    },
    pincode: {
      type: String,
      required: true
    },
    landmark: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSnapshotSchema],
      required: true,
      validate: [val => val.length > 0, 'Order must contain at least one item']
    },
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String,
      trim: true,
      uppercase: true
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    shippingAddress: {
      type: shippingAddressSnapshotSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.RAZORPAY
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true
    },
    paymentId: {
      type: String,
      trim: true
    },
    razorpayOrderId: {
      type: String,
      trim: true,
      index: true
    },
    notes: {
      type: String,
      trim: true
    },
    trackingInfo: {
      carrier: String,
      trackingNumber: String,
      shippedAt: Date,
      estimatedDelivery: Date
    },
    cancellationReason: String,
    cancelledAt: Date
  },
  {
    timestamps: true
  }
);

// Helpful indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

/**
 * Generate human-friendly sequential or random order number (e.g. CN-849201)
 */
orderSchema.statics.generateOrderNumber = function () {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `CN-${randomSuffix}`;
};

const Order = mongoose.model('Order', orderSchema);
export default Order;
