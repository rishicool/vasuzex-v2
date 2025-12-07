/**
 * Global Error Handlers
 */

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
}

/**
 * Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.APP_ENV === 'development' && { stack: err.stack }),
  });
}
