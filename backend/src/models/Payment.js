import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true
    },
    razorpaySignature: {
      type: String
    },
    amount: {
      type: Number,
      required: true
    },
    amountInPaise: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.CREATED,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    method: {
      type: String
    },
    webhookEvents: [
      {
        eventId: {
          type: String,
          required: true
        },
        event: {
          type: String,
          required: true
        },
        payload: {
          type: mongoose.Schema.Types.Mixed
        },
        processedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
