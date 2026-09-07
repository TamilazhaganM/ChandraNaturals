import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ERROR_CODES, ROLES } from '../config/constants.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication Middleware: Verifies Bearer JWT Access Token
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Authentication required. Please provide a valid authorization token.',
        errorCode: ERROR_CODES.UNAUTHORIZED
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'The account belonging to this token no longer exists.',
        errorCode: ERROR_CODES.UNAUTHORIZED
      });
    }

    // Check if account is active
    if (!currentUser.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Your account has been deactivated. Please contact support.',
        errorCode: ERROR_CODES.ACCOUNT_INACTIVE
      });
    }

    // Check if password changed after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Password was recently changed. Please log in again.',
        errorCode: ERROR_CODES.UNAUTHORIZED
      });
    }

    // Grant access & attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Authorization Middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Access forbidden: You do not have permission to perform this action.',
        errorCode: ERROR_CODES.FORBIDDEN
      });
    }
    next();
  };
};

/**
 * Convenience Middleware: Admin Only
 */
export const requireAdmin = [authenticate, authorize(ROLES.ADMIN)];
