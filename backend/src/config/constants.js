/**
 * Application Constants and Enums for Chandra Naturals
 */

export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  ADMIN: 'admin'
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
});

export const PAYMENT_STATUS = Object.freeze({
  CREATED: 'created',
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
});

export const PAYMENT_METHOD = Object.freeze({
  RAZORPAY: 'razorpay',
  COD: 'cod',
  WHATSAPP: 'whatsapp'
});

export const OTP_PURPOSE = Object.freeze({
  REGISTRATION: 'registration',
  LOGIN: 'login',
  FORGOT_PASSWORD: 'forgot_password'
});

export const BUSINESS_RULES = Object.freeze({
  FREE_SHIPPING_THRESHOLD: 3000,
  STANDARD_SHIPPING_FEE: 99,
  OTP_LENGTH: 6,
  OTP_MAX_ATTEMPTS: 5,
  OTP_EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
  OTP_RESEND_COOLDOWN_MS: 60 * 1000, // 60 seconds
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY_DAYS: 7
});

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_MAX_ATTEMPTS_EXCEEDED: 'OTP_MAX_ATTEMPTS_EXCEEDED',
  OTP_COOLDOWN_ACTIVE: 'OTP_COOLDOWN_ACTIVE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PRODUCT_INACTIVE: 'PRODUCT_INACTIVE',
  COUPON_INVALID: 'COUPON_INVALID',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
});
