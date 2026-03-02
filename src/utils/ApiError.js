class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 400 Bad Request
   */
  static badRequest(message) {
    return new ApiError(400, message);
  }

  /**
   * 401 Unauthorized
   */
  static unauthorized(message) {
    return new ApiError(401, message);
  }

  /**
   * 403 Forbidden
   */
  static forbidden(message) {
    return new ApiError(403, message);
  }

  /**
   * 404 Not Found
   */
  static notFound(message) {
    return new ApiError(404, message);
  }

  /**
   * 500 Internal Server Error
   */
  static internal(message) {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
