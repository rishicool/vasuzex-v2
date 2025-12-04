/**
 * HTTP Middleware Module
 * 
 * Provides common middleware for Express applications.
 */

// Authentication & Authorization
export {
  Authenticate,
  authenticate,
  optionalAuth,
} from './Authenticate.js';

export {
  Authorize,
  authorize,
  requireRole,
  requirePermission,
} from './Authorize.js';

// Validation
export {
  ValidateRequest,
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  CommonValidators,
} from './ValidateRequest.js';

// Error Handling
export {
  handleErrors,
  notFoundHandler,
  createExceptionHandler,
} from './HandleErrors.js';

// Rate Limiting
export {
  rateLimiter,
  strictRateLimiter,
  apiRateLimiter,
  bruteForceLimiter,
  rateLimiterByIP,
  rateLimiterByUser,
} from './RateLimiter.js';

// Request/Response Wrapping
export {
  requestResponseMiddleware,
} from './RequestResponseMiddleware.js';
