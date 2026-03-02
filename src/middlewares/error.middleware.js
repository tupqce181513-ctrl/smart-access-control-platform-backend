const ApiError = require('../utils/ApiError');

/**
 * Global error handling middleware
 * Must be registered AFTER all other middlewares and routes
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle ApiError
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle Mongoose ValidationError
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
  }
  // Handle Mongoose CastError
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${error.path}: ${error.value}`;
  }
  // Handle Mongoose Duplicate Key Error
  else if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyPattern)[0];
    message = `${field} already exists`;
  }
  // Handle JWT TokenExpiredError
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }
  // Handle JWT JsonWebTokenError
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  // Handle generic errors
  else if (error.message) {
    message = error.message;
  }

  // Build response
  const response = {
    success: false,
    message,
    ...(details && { details }),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
