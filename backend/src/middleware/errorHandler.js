import { ERROR_CODES } from '../config/constants.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Centralized Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let errors = err.errors || null;

  // Log error details on server
  console.error(`❌ [${req.method}] ${req.originalUrl} - Error:`, {
    name: err.name,
    message: err.message,
    code: err.code,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });

  // 1. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation failed for one or more fields.';
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // 2. Mongoose CastError (Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = ERROR_CODES.NOT_FOUND;
    message = `Resource not found with specified identifier: ${err.value}`;
  }

  // 3. MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = ERROR_CODES.DUPLICATE_ENTRY;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `An account or record with this ${field} ('${value}') already exists.`;
  }

  // 4. JWT Verification Error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
    message = 'Invalid authentication token. Please sign in again.';
  }

  // 5. JWT Token Expired Error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
    message = 'Authentication session has expired. Please refresh your session or sign in.';
  }

  return errorResponse(res, {
    statusCode,
    message,
    errorCode,
    errors
  });
};

/**
 * 404 Not Found Route Handler
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`,
    errorCode: ERROR_CODES.NOT_FOUND
  });
};
