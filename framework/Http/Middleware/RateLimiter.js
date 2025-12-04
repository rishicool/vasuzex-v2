import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../../Exceptions/index.js';

/**
 * RateLimiter Middleware
 * 
 * Rate limiting middleware to prevent abuse.
 * Uses express-rate-limit package.
 */

/**
 * Create rate limiter middleware
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 * 
 * @example
 * router.post('/login', rateLimiter({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 5, // 5 requests per window
 *   message: 'Too many login attempts'
 * }), loginController);
 */
export function rateLimiter(options = {}) {
  const defaults = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    
    // Custom handler to throw error instead of sending response
    handler: (req, res, next) => {
      next(new TooManyRequestsError(options.message || defaults.message));
    },
    
    // Skip successful requests (optional)
    skipSuccessfulRequests: false,
    
    // Skip failed requests (optional)
    skipFailedRequests: false,
  };

  return rateLimit({ ...defaults, ...options });
}

/**
 * Create strict rate limiter (for sensitive endpoints)
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 * 
 * @example
 * router.post('/login', strictRateLimiter(), loginController);
 */
export function strictRateLimiter(options = {}) {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many attempts, please try again later',
    ...options,
  });
}

/**
 * Create API rate limiter (for general API endpoints)
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 * 
 * @example
 * router.use('/api', apiRateLimiter());
 */
export function apiRateLimiter(options = {}) {
  return rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'API rate limit exceeded',
    ...options,
  });
}

/**
 * Create slow brute force protection
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 * 
 * @example
 * router.post('/login', bruteForceLimiter(), loginController);
 */
export function bruteForceLimiter(options = {}) {
  return rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    skipSuccessfulRequests: true, // Don't count successful requests
    message: 'Too many failed attempts, please try again later',
    ...options,
  });
}

/**
 * Create rate limiter by IP
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 */
export function rateLimiterByIP(options = {}) {
  return rateLimiter({
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    ...options,
  });
}

/**
 * Create rate limiter by user ID
 * 
 * @param {object} options - Rate limit options
 * @returns {function} Express middleware
 * 
 * @example
 * router.post('/posts', authenticate(), rateLimiterByUser({ max: 10 }), createPostController);
 */
export function rateLimiterByUser(options = {}) {
  return rateLimiter({
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    ...options,
  });
}
