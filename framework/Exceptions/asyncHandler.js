/**
 * asyncHandler - Async/await error handling wrapper
 * 
 * Wraps async route handlers to catch errors and pass them to next()
 * Eliminates the need for try-catch blocks in every async controller method.
 * 
 * @param {function} fn - Async function to wrap
 * @returns {function} Express middleware function
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.all();
 *   res.json({ users });
 * }));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * asyncMiddleware - Async middleware error handler
 * 
 * Similar to asyncHandler but designed for middleware that may call next()
 * 
 * @param {function} fn - Async middleware function
 * @returns {function} Express middleware function
 */
export function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * catchAsync - Alternative name for asyncHandler
 * 
 * @param {function} fn - Async function to wrap
 * @returns {function} Express middleware function
 */
export const catchAsync = asyncHandler;
