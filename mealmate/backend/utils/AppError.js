/**
 * Custom error class that carries an HTTP status code.
 * Thrown inside controllers; caught by the global error middleware.
 *
 * Usage:
 *   throw new AppError('User not found', 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;           // tells error middleware this is expected
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
