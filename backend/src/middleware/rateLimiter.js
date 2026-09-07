import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Standard API Rate Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
      errorCode: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Sensitive Authentication Endpoints Rate Limiter (Login, Register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many login or registration attempts. Please try again after 15 minutes.',
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

/**
 * Strict OTP Send / Resend Limiter
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 OTP generation attempts per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      statusCode: 429,
      message: 'Too many OTP requests. Please wait a few minutes before requesting another code.',
      errorCode: 'OTP_RATE_LIMIT_EXCEEDED'
    });
  }
});
