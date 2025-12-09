/**
 * Async Handler Middleware
 * Wraps async controller methods to catch errors automatically
 * Laravel-style error handling for Express async routes
 * 
 * @example
 * import { asyncHandler } from 'vasuzex/Http';
 * 
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.all();
 *   res.json(users);
 * }));
 */

/**
 * Wrap an async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
