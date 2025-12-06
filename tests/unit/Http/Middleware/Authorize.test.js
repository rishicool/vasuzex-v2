/**
 * Authorize Middleware Tests
 * 
 * Comprehensive test suite for authorization middleware covering:
 * - Authorize class with Gate integration
 * - authorize() factory function
 * - requireRole() middleware
 * - requirePermission() middleware
 * - Single and multiple ability checking
 * - requireAll vs requireAny logic
 * - Error handling and user authentication checks
 * 
 * Test Coverage:
 * - Authorize class: handle(), middleware()
 * - authorize() factory with abilities
 * - requireRole() with single/multiple roles
 * - requirePermission() with single/multiple permissions
 * - ForbiddenError handling
 * - Gate integration
 * 
 * @total-tests: 30
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Authorize, authorize, requireRole, requirePermission } from '../../../../framework/Http/Middleware/Authorize.js';
import { ForbiddenError } from '../../../../framework/Exceptions/index.js';

describe('Authorize Middleware', () => {
  let req, res, next;
  let mockGate;

  beforeEach(() => {
    mockGate = {
      forUser: jest.fn(),
      allows: jest.fn()
    };

    req = {
      user: { id: 1, name: 'Test User' },
      app: {
        locals: {
          Gate: mockGate
        }
      }
    };

    res = {};
    next = jest.fn();
  });

  describe('Authorize Class', () => {
    test('should initialize with single ability', () => {
      const middleware = new Authorize('create-post');
      expect(middleware.abilities).toEqual(['create-post']);
    });

    test('should initialize with multiple abilities', () => {
      const middleware = new Authorize(['create-post', 'delete-post']);
      expect(middleware.abilities).toEqual(['create-post', 'delete-post']);
    });

    test('should initialize with options', () => {
      const options = { requireAll: false, message: 'Custom message' };
      const middleware = new Authorize('create-post', options);
      expect(middleware.options).toEqual(options);
    });

    test('should throw ForbiddenError if user not authenticated', async () => {
      req.user = null;
      const middleware = new Authorize('create-post');

      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });

    test('should throw error if Gate not available', async () => {
      req.app.locals.Gate = null;
      global.Gate = null;
      const middleware = new Authorize('create-post');

      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Gate service not available');
    });

    test('should use global Gate if app.locals.Gate not available', async () => {
      req.app.locals.Gate = null;
      global.Gate = mockGate;
      mockGate.allows.mockResolvedValue(true);

      const middleware = new Authorize('create-post');
      await middleware.handle(req, res, next);

      expect(mockGate.forUser).toHaveBeenCalledWith(req.user);
      expect(next).toHaveBeenCalledWith();
    });

    test('should set current user on Gate', async () => {
      mockGate.allows.mockResolvedValue(true);

      const middleware = new Authorize('create-post');
      await middleware.handle(req, res, next);

      expect(mockGate.forUser).toHaveBeenCalledWith(req.user);
    });

    test('should allow request when user has required ability', async () => {
      mockGate.allows.mockResolvedValue(true);

      const middleware = new Authorize('create-post');
      await middleware.handle(req, res, next);

      expect(mockGate.allows).toHaveBeenCalledWith('create-post', undefined);
      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks ability', async () => {
      mockGate.allows.mockResolvedValue(false);

      const middleware = new Authorize('create-post');
      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('You do not have permission to create-post');
    });

    test('should allow request when user has all required abilities (requireAll)', async () => {
      mockGate.allows.mockResolvedValue(true);

      const middleware = new Authorize(['create-post', 'delete-post'], { requireAll: true });
      await middleware.handle(req, res, next);

      expect(mockGate.allows).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks one of required abilities (requireAll)', async () => {
      mockGate.allows
        .mockResolvedValueOnce(true)  // create-post allowed
        .mockResolvedValueOnce(false); // delete-post denied

      const middleware = new Authorize(['create-post', 'delete-post'], { requireAll: true });
      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    test('should allow request when user has at least one ability (requireAll: false)', async () => {
      mockGate.allows
        .mockResolvedValueOnce(false) // create-post denied
        .mockResolvedValueOnce(true);  // delete-post allowed

      const middleware = new Authorize(['create-post', 'delete-post'], { requireAll: false });
      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks all abilities (requireAll: false)', async () => {
      mockGate.allows.mockResolvedValue(false);

      const middleware = new Authorize(['create-post', 'delete-post'], { requireAll: false });
      await middleware.handle(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('You do not have the required permissions');
    });

    test('should use custom error message', async () => {
      mockGate.allows.mockResolvedValue(false);

      const middleware = new Authorize('create-post', { message: 'Custom forbidden message' });
      await middleware.handle(req, res, next);

      expect(next.mock.calls[0][0].message).toBe('Custom forbidden message');
    });

    test('should pass resource to Gate.allows()', async () => {
      mockGate.allows.mockResolvedValue(true);

      const resource = { id: 1, title: 'Test Post' };
      const middleware = new Authorize('edit-post', { resource });
      await middleware.handle(req, res, next);

      expect(mockGate.allows).toHaveBeenCalledWith('edit-post', resource);
    });

    test('should return middleware function', () => {
      const middleware = new Authorize('create-post');
      const middlewareFn = middleware.middleware();

      expect(typeof middlewareFn).toBe('function');
    });
  });

  describe('authorize() factory', () => {
    test('should create middleware with single ability', async () => {
      mockGate.allows.mockResolvedValue(true);

      const middleware = authorize('create-post');
      await middleware(req, res, next);

      expect(mockGate.allows).toHaveBeenCalledWith('create-post', undefined);
      expect(next).toHaveBeenCalledWith();
    });

    test('should create middleware with multiple abilities', async () => {
      mockGate.allows.mockResolvedValue(true);

      const middleware = authorize(['create-post', 'delete-post']);
      await middleware(req, res, next);

      expect(mockGate.allows).toHaveBeenCalledTimes(2);
      expect(next).toHaveBeenCalledWith();
    });

    test('should create middleware with options', async () => {
      mockGate.allows.mockResolvedValue(false);

      const middleware = authorize('create-post', { message: 'No access' });
      await middleware(req, res, next);

      expect(next.mock.calls[0][0].message).toBe('No access');
    });
  });

  describe('requireRole() middleware', () => {
    test('should allow user with required role', async () => {
      req.user.role = 'admin';

      const middleware = requireRole('admin');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should allow user with required role (array format)', async () => {
      req.user.roles = ['admin', 'moderator'];

      const middleware = requireRole('admin');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks role', async () => {
      req.user.role = 'user';

      const middleware = requireRole('admin');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('You do not have the required role(s)');
    });

    test('should allow user with all required roles (requireAll)', async () => {
      req.user.roles = ['admin', 'moderator'];

      const middleware = requireRole(['admin', 'moderator'], { requireAll: true });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks one role (requireAll)', async () => {
      req.user.roles = ['admin'];

      const middleware = requireRole(['admin', 'moderator'], { requireAll: true });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    test('should allow user with at least one role (requireAll: false)', async () => {
      req.user.roles = ['moderator'];

      const middleware = requireRole(['admin', 'moderator'], { requireAll: false });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError if user not authenticated', async () => {
      req.user = null;

      const middleware = requireRole('admin');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });

    test('should use custom error message', async () => {
      req.user.role = 'user';

      const middleware = requireRole('admin', { message: 'Admin only' });
      await middleware(req, res, next);

      expect(next.mock.calls[0][0].message).toBe('Admin only');
    });
  });

  describe('requirePermission() middleware', () => {
    test('should allow user with required permission', async () => {
      req.user.permissions = ['create-post'];

      const middleware = requirePermission('create-post');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks permission', async () => {
      req.user.permissions = ['read-post'];

      const middleware = requirePermission('create-post');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('You do not have the required permission(s)');
    });

    test('should allow user with all required permissions (requireAll)', async () => {
      req.user.permissions = ['create-post', 'delete-post'];

      const middleware = requirePermission(['create-post', 'delete-post'], { requireAll: true });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError when user lacks one permission (requireAll)', async () => {
      req.user.permissions = ['create-post'];

      const middleware = requirePermission(['create-post', 'delete-post'], { requireAll: true });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    test('should allow user with at least one permission (requireAll: false)', async () => {
      req.user.permissions = ['delete-post'];

      const middleware = requirePermission(['create-post', 'delete-post'], { requireAll: false });
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    test('should throw ForbiddenError if user not authenticated', async () => {
      req.user = null;

      const middleware = requirePermission('create-post');
      await middleware(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect(next.mock.calls[0][0].message).toBe('User not authenticated');
    });

    test('should use custom error message', async () => {
      req.user.permissions = [];

      const middleware = requirePermission('create-post', { message: 'Insufficient permissions' });
      await middleware(req, res, next);

      expect(next.mock.calls[0][0].message).toBe('Insufficient permissions');
    });
  });
});
