import mongoose from 'mongoose';
import crypto from 'crypto';
import { OTP_PURPOSE, BUSINESS_RULES } from '../config/constants.js';

const otpVerificationSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSE),
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically removes expired OTP records
    },
    attempts: {
      type: Number,
      default: 0,
      max: BUSINESS_RULES.OTP_MAX_ATTEMPTS
    },
    resendAvailableAt: {
      type: Date,
      default: () => new Date(Date.now() + BUSINESS_RULES.OTP_RESEND_COOLDOWN_MS)
    },
    isUsed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast queries
otpVerificationSchema.index({ identifier: 1, purpose: 1, isUsed: 1 });

/**
 * Static method to hash a raw 6-digit OTP string
 */
otpVerificationSchema.statics.hashOTP = function (rawOTP) {
  return crypto.createHash('sha256').update(String(rawOTP).trim()).digest('hex');
};

/**
 * Static method to generate a cryptographically secure 6-digit OTP
 */
otpVerificationSchema.statics.generateSecureOTP = function () {
  // Generates 6-digit number between 100000 and 999999
  const buffer = crypto.randomBytes(4);
  const code = (buffer.readUInt32BE(0) % 900000) + 100000;
  return String(code);
};

const OTPVerification = mongoose.model('OTPVerification', otpVerificationSchema);
export default OTPVerification;
