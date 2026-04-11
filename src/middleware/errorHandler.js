const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return ApiResponse.error(res, 'Validation error', 422, messages);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  return ApiResponse.error(res, 'Internal server error', 500);
};

module.exports = errorHandler;
