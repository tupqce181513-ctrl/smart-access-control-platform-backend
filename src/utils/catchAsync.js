/**
 * Higher-order function to wrap async route handlers
 * Automatically catches errors and passes them to the next middleware
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
