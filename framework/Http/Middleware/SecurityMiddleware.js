import helmet from 'helmet';
import cors from 'cors';
import { doubleCsrf } from 'csrf-csrf';

/**
 * SecurityMiddleware - Laravel-inspired security middleware
 * 
 * Provides comprehensive security features including:
 * - Helmet.js security headers
 * - CORS configuration
 * - CSRF protection (using csrf-csrf)
 * - Custom security headers
 */
class SecurityMiddleware {
  /**
   * Create security middleware instance
   * 
   * @param {Object} config - Security configuration
   */
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Get Helmet middleware with configured options
   * 
   * @returns {Function} Helmet middleware
   */
  helmet() {
    const helmetConfig = this.config.helmet || {};
    return helmet(helmetConfig);
  }

  /**
   * Get CORS middleware with configured options
   * 
   * @returns {Function} CORS middleware
   */
  cors() {
    const corsConfig = this.config.cors || {};
    
    // Handle multiple origins
    if (typeof corsConfig.origin === 'string' && corsConfig.origin.includes(',')) {
      corsConfig.origin = corsConfig.origin.split(',').map(o => o.trim());
    }

    // Handle dynamic origin function
    if (corsConfig.origin && typeof corsConfig.origin !== 'function') {
      const configuredOrigin = Array.isArray(corsConfig.origin)
        ? corsConfig.origin
        : [corsConfig.origin];

      corsConfig.origin = (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || configuredOrigin.includes('*') || configuredOrigin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      };
    }

    return cors(corsConfig);
  }

  /**
   * Get CSRF protection middleware
   * 
   * @returns {Object|null} CSRF middleware object or null if disabled
   */
  csrf() {
    const csrfConfig = this.config.csrf || {};

    if (!csrfConfig.enabled) {
      return null;
    }

    // Create CSRF protection using csrf-csrf
    const {
      generateToken, // Generates a secret+token pair
      doubleCsrfProtection, // The middleware to apply to routes
    } = doubleCsrf({
      getSecret: (req) => req.secret, // Secret getter from request
      cookieName: csrfConfig.cookie?.name || '_csrf',
      cookieOptions: {
        httpOnly: csrfConfig.cookie?.httpOnly !== false,
        secure: csrfConfig.cookie?.secure !== false && process.env.NODE_ENV === 'production',
        sameSite: csrfConfig.cookie?.sameSite || 'strict',
        path: csrfConfig.cookie?.path || '/',
        maxAge: csrfConfig.cookie?.maxAge || 86400000, // 24 hours
      },
      size: 64, // Token size
      ignoredMethods: csrfConfig.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'],
      getTokenFromRequest: (req) => {
        // Try header first, then body
        return req.headers['x-csrf-token'] || 
               req.headers['x-xsrf-token'] || 
               req.body?._csrf ||
               req.body?.csrf_token;
      },
    });

    // Store token generator for later use
    this.csrfTokenGenerator = generateToken;

    // Return wrapped middleware that respects ignored paths
    return (req, res, next) => {
      // Check if path should be ignored
      const ignoredPaths = csrfConfig.ignorePaths || [];
      const isIgnoredPath = ignoredPaths.some(pattern => {
        if (pattern.includes('*')) {
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(req.path);
        }
        return req.path === pattern;
      });

      if (isIgnoredPath) {
        return next();
      }

      // Apply CSRF middleware
      doubleCsrfProtection(req, res, (err) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed',
            error: err.code || 'INVALID_CSRF_TOKEN'
          });
        }

        // Generate and attach CSRF token to response
        const { token } = generateToken(req, res);
        res.locals.csrfToken = token;
        
        // Also set in header for SPA convenience
        res.setHeader('X-CSRF-Token', token);
        
        next();
      });
    };
  }

  /**
   * Get custom headers middleware
   * 
   * @returns {Function} Custom headers middleware
   */
  customHeaders() {
    const headers = this.config.customHeaders || {};

    return (req, res, next) => {
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      next();
    };
  }

  /**
   * Get trusted proxy configuration middleware
   * 
   * @param {Object} app - Express application
   * @returns {void}
   */
  setupTrustedProxies(app) {
    const trustedProxies = this.config.trustedProxies || [];

    if (trustedProxies.length > 0) {
      app.set('trust proxy', trustedProxies);
    } else if (process.env.TRUST_PROXY === 'true') {
      app.set('trust proxy', true);
    }
  }

  /**
   * Get all security middleware in correct order
   * 
   * @returns {Array<Function>} Array of middleware functions
   */
  getMiddleware() {
    const middleware = [];

    // 1. Helmet security headers (should be first)
    middleware.push(this.helmet());

    // 2. CORS configuration
    middleware.push(this.cors());

    // 3. Custom security headers
    if (this.config.customHeaders) {
      middleware.push(this.customHeaders());
    }

    // 4. CSRF protection (if enabled)
    const csrfMiddleware = this.csrf();
    if (csrfMiddleware) {
      middleware.push(csrfMiddleware);
    }

    return middleware;
  }
}

/**
 * Factory function to create security middleware
 * 
 * @param {Object} config - Security configuration
 * @returns {SecurityMiddleware} Security middleware instance
 */
export function createSecurityMiddleware(config) {
  return new SecurityMiddleware(config);
}

/**
 * Helper function to apply all security middleware to Express app
 * 
 * @param {Object} app - Express application
 * @param {Object} config - Security configuration
 * @returns {void}
 */
export function applySecurityMiddleware(app, config) {
  const security = new SecurityMiddleware(config);

  // Setup trusted proxies first
  security.setupTrustedProxies(app);

  // Apply all middleware
  const middleware = security.getMiddleware();
  middleware.forEach(mw => app.use(mw));
}

export { SecurityMiddleware };
export default SecurityMiddleware;
