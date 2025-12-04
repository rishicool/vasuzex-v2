import { ExceptionHandler } from '../../Exceptions/index.js';
import { NotFoundError } from '../../Exceptions/index.js';

/**
 * HandleErrors Middleware
 * 
 * Global error handling middleware for Express applications.
 * Should be registered last in middleware stack.
 */

/**
 * Create error handler middleware
 * 
 * @param {object} options - Handler options
 * @returns {function} Express error middleware
 * 
 * @example
 * app.use(handleErrors({ debug: true }));
 */
export function handleErrors(options = {}) {
  const handler = new ExceptionHandler(options);
  return handler.middleware();
}

/**
 * Create not found (404) handler middleware
 * 
 * @param {object} options - Handler options
 * @returns {function} Express middleware
 * 
 * @example
 * app.use(notFoundHandler());
 * app.use(handleErrors());
 */
export function notFoundHandler(options = {}) {
  return (req, res, next) => {
    next(
      new NotFoundError(
        options.message || `Route ${req.method} ${req.url} not found`
      )
    );
  };
}

/**
 * Create custom exception handler
 * 
 * @param {object} options - Handler options
 * @returns {ExceptionHandler} Exception handler instance
 * 
 * @example
 * const handler = createExceptionHandler({
 *   debug: process.env.NODE_ENV === 'development',
 *   dontReport: [NotFoundError],
 *   reportableErrors: [InternalServerError]
 * });
 * 
 * app.use(handler.middleware());
 */
export function createExceptionHandler(options = {}) {
  return new ExceptionHandler(options);
}
