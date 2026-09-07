import { body, validationResult } from 'express-validator';
import { OTP_PURPOSE, ERROR_CODES } from '../config/constants.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware that checks express-validator results and returns consistent error response
 */
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Invalid input data provided',
      errorCode: ERROR_CODES.VALIDATION_ERROR,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  checkValidation
];

export const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  checkValidation
];

export const validateVerifyOTP = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number identifier is required'),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('OTP purpose is required')
    .isIn(Object.values(OTP_PURPOSE))
    .withMessage(`Purpose must be one of: ${Object.values(OTP_PURPOSE).join(', ')}`),

  checkValidation
];

export const validateSendOTP = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number identifier is required'),

  body('purpose')
    .trim()
    .notEmpty()
    .withMessage('OTP purpose is required')
    .isIn(Object.values(OTP_PURPOSE))
    .withMessage(`Purpose must be one of: ${Object.values(OTP_PURPOSE).join(', ')}`),

  checkValidation
];

export const validateForgotPassword = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number is required'),

  checkValidation
];

export const validateResetPassword = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or mobile number identifier is required'),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),

  checkValidation
];

export const validateSendEmailOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  checkValidation
];

export const validateVerifyEmailOTP = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),

  checkValidation
];
