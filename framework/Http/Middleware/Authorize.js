import { ForbiddenError } from '../../Exceptions/index.js';

/**
 * Authorize Middleware
 * 
 * Checks if authenticated user has required permissions/roles.
 * Uses Laravel-inspired Gate system.
 */
export class Authorize {
  /**
   * Create authorize middleware
   * 
   * @param {string|array} abilities - Ability or array of abilities to check
   * @param {object} options - Additional options
   */
  constructor(abilities, options = {}) {
    this.abilities = Array.isArray(abilities) ? abilities : [abilities];
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
      // Ensure user is authenticated
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      // Get Gate facade
      const Gate = req.app?.locals?.Gate || global.Gate;

      if (!Gate) {
        throw new Error('Gate service not available');
      }

      // Set the current user for Gate
      Gate.forUser(req.user);

      // Check abilities
      const requireAll = this.options.requireAll !== false;

      if (requireAll) {
        // User must have all abilities
        for (const ability of this.abilities) {
          const allowed = await Gate.allows(ability, this.options.resource);
          
          if (!allowed) {
            throw new ForbiddenError(
              this.options.message || `You do not have permission to ${ability}`
            );
          }
        }
      } else {
        // User must have at least one ability
        let hasAny = false;
        
        for (const ability of this.abilities) {
          const allowed = await Gate.allows(ability, this.options.resource);
          
          if (allowed) {
            hasAny = true;
            break;
          }
        }

        if (!hasAny) {
          throw new ForbiddenError(
            this.options.message || 'You do not have the required permissions'
          );
        }
      }

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
 * Create authorize middleware factory
 * 
 * @param {string|array} abilities - Ability or array of abilities
 * @param {object} options - Additional options
 * @returns {function} Express middleware
 * 
 * @example
 * router.delete('/posts/:id', authorize('delete-post'), (req, res) => {
 *   // User has permission to delete posts
 * });
 * 
 * @example
 * router.post('/admin', authorize(['create-user', 'delete-user'], {
 *   requireAll: false // User needs at least one permission
 * }), (req, res) => {
 *   // User has at least one admin permission
 * });
 */
export function authorize(abilities, options = {}) {
  const middleware = new Authorize(abilities, options);
  return middleware.middleware();
}

/**
 * Create role-based authorization middleware
 * 
 * @param {string|array} roles - Role or array of roles
 * @param {object} options - Additional options
 * @returns {function} Express middleware
 * 
 * @example
 * router.get('/admin/dashboard', requireRole('admin'), (req, res) => {
 *   // User has admin role
 * });
 * 
 * @example
 * router.get('/moderator', requireRole(['admin', 'moderator'], {
 *   requireAll: false
 * }), (req, res) => {
 *   // User has admin OR moderator role
 * });
 */
export function requireRole(roles, options = {}) {
  const roleList = Array.isArray(roles) ? roles : [roles];
  const requireAll = options.requireAll !== false;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const userRoles = req.user.roles || req.user.role || [];
      const userRoleList = Array.isArray(userRoles) ? userRoles : [userRoles];

      if (requireAll) {
        // User must have all roles
        const hasAllRoles = roleList.every(role => userRoleList.includes(role));
        
        if (!hasAllRoles) {
          throw new ForbiddenError(
            options.message || 'You do not have the required role(s)'
          );
        }
      } else {
        // User must have at least one role
        const hasAnyRole = roleList.some(role => userRoleList.includes(role));
        
        if (!hasAnyRole) {
          throw new ForbiddenError(
            options.message || 'You do not have the required role(s)'
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Create permission-based authorization middleware
 * 
 * @param {string|array} permissions - Permission or array of permissions
 * @param {object} options - Additional options
 * @returns {function} Express middleware
 * 
 * @example
 * router.post('/posts', requirePermission('create-post'), (req, res) => {
 *   // User has create-post permission
 * });
 */
export function requirePermission(permissions, options = {}) {
  const permissionList = Array.isArray(permissions) ? permissions : [permissions];
  const requireAll = options.requireAll !== false;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      const userPermissions = req.user.permissions || [];
      const userPermissionList = Array.isArray(userPermissions) ? userPermissions : [userPermissions];

      if (requireAll) {
        // User must have all permissions
        const hasAllPermissions = permissionList.every(
          permission => userPermissionList.includes(permission)
        );
        
        if (!hasAllPermissions) {
          throw new ForbiddenError(
            options.message || 'You do not have the required permission(s)'
          );
        }
      } else {
        // User must have at least one permission
        const hasAnyPermission = permissionList.some(
          permission => userPermissionList.includes(permission)
        );
        
        if (!hasAnyPermission) {
          throw new ForbiddenError(
            options.message || 'You do not have the required permission(s)'
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
