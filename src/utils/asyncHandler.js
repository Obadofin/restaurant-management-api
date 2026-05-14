/**
 * Wraps async route handlers so Express automatically catches any errors they throw.
 * 
 * Normally, if an async function throws an error, Express doesn't know about it and the request hangs.
 * This wrapper forwards the error to Express's error handler so your app responds properly instead of crashing silently.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;