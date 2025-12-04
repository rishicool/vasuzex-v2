import { UnauthorizedError } from '../../Exceptions/index.js';

/**
 * Authenticate Middleware
 * 
 * Authenticates requests using specified guard.
 * Laravel-inspired authentication middleware.
 */
export class Authenticate {
  /**
   * Create authenticate middleware
   * 
   * @param {string|null} guard - Guard name to use
   * @param {object} options - Additional options
   */
  constructor(guard = null, options = {}) {
    this.guard = guard;
    this.options = options;
  }

  /**
   * Handle the request
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      // Get Auth facade (will be available via service container)
      const Auth = req.app?.locals?.Auth || global.Auth;
      
      if (!Auth) {
        throw new Error('Auth service not available');
      }

      // Get the guard
      const guard = Auth.guard(this.guard);

      // Check if user is authenticated
      const user = await guard.user();

      if (!user) {
        throw new UnauthorizedError(
          this.options.message || 'Unauthenticated'
        );
      }

      // Attach user to request
      req.user = user;
      req.auth = guard;

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create middleware function
   * 
   * @returns {function} Express middleware
   */
  middleware() {
    return (req, res, next) => this.handle(req, res, next);
  }
}

/**
 * Create authenticate middleware factory
 * 
 * @param {string|null} guard - Guard name
 * @param {object} options - Additional options
 * @returns {function} Express middleware
 * 
 * @example
 * router.get('/profile', authenticate('api'), (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
export function authenticate(guard = null, options = {}) {
  const middleware = new Authenticate(guard, options);
  return middleware.middleware();
}

/**
 * Create optional authenticate middleware
 * 
 * Attempts authentication but doesn't fail if not authenticated.
 * Useful for endpoints that work for both authenticated and guest users.
 * 
 * @param {string|null} guard - Guard name
 * @returns {function} Express middleware
 * 
 * @example
 * router.get('/posts', optionalAuth('api'), (req, res) => {
 *   // req.user will be set if authenticated, null otherwise
 *   const posts = req.user ? getUserPosts(req.user) : getPublicPosts();
 *   res.json({ posts });
 * });
 */
export function optionalAuth(guard = null) {
  return async (req, res, next) => {
    try {
      const Auth = req.app?.locals?.Auth || global.Auth;
      
      if (!Auth) {
        return next();
      }

      const authGuard = Auth.guard(guard);
      const user = await authGuard.user();

      if (user) {
        req.user = user;
        req.auth = authGuard;
      }

      next();
    } catch (error) {
      // Don't fail on authentication errors
      next();
    }
  };
}
