import express from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  sendEmailOTPVerification,
  verifyEmailOTPVerification,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateSendOTP,
  validateSendEmailOTP,
  validateVerifyEmailOTP,
  validateForgotPassword,
  validateResetPassword
} from '../validators/authValidators.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Registration & OTP verification
router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-otp', authLimiter, validateVerifyOTP, verifyOTP);
router.post('/send-otp', otpLimiter, validateSendOTP, resendOTP);
router.post('/resend-otp', otpLimiter, validateSendOTP, resendOTP);
router.post('/send-email-otp', otpLimiter, validateSendEmailOTP, sendEmailOTPVerification);
router.post('/verify-email-otp', authLimiter, validateVerifyEmailOTP, verifyEmailOTPVerification);

// Login & Session Management
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, authLimiter, changePassword);

// Password Reset
router.post('/forgot-password', otpLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, resetPassword);

export default router;
