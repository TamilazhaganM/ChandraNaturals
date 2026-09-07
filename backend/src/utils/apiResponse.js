/**
 * Consistent API Response Formatter
 */

export const successResponse = (res, { statusCode = 200, message = 'Success', data = {} } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (
  res,
  { statusCode = 500, message = 'An unexpected error occurred', errorCode = 'SERVER_ERROR', errors = null } = {}
) => {
  const payload = {
    success: false,
    message,
    errorCode
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
