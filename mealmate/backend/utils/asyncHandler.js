/**
 * Wraps an async Express route handler so unhandled promise rejections
 * are forwarded to the global error-handling middleware via next(err),
 * instead of causing an unhandled-rejection crash.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
