import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  Authenticate,
  authenticate,
  optionalAuth,
} from '../../../../framework/Http/Middleware/Authenticate.js';
import { UnauthorizedError } from '../../../../framework/Exceptions/index.js';

describe('Authenticate Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockAuth;
  let mockGuard;
  let mockUser;

  beforeEach(() => {
    mockUser = { id: 1, email: 'test@example.com' };
    
    mockGuard = {
      user: jest.fn().mockResolvedValue(mockUser),
    };

    mockAuth = {
      guard: jest.fn().mockReturnValue(mockGuard),
    };

    mockReq = {
      app: {
        locals: {
          Auth: mockAuth,
        },
      },
    };

    mockRes = {};
    mockNext = jest.fn();
  });

  describe('Authenticate class', () => {
    it('should create middleware instance', () => {
      const middleware = new Authenticate('api');
      expect(middleware.guard).toBe('api');
      expect(middleware.options).toEqual({});
    });

    it('should create with options', () => {
      const options = { message: 'Custom message' };
      const middleware = new Authenticate('api', options);
      expect(middleware.options).toEqual(options);
    });

    it('should authenticate user successfully', async () => {
      const middleware = new Authenticate('api');
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockAuth.guard).toHaveBeenCalledWith('api');
      expect(mockGuard.user).toHaveBeenCalled();
      expect(mockReq.user).toEqual(mockUser);
      expect(mockReq.auth).toEqual(mockGuard);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should fail when user not authenticated', async () => {
      mockGuard.user.mockResolvedValue(null);
      
      const middleware = new Authenticate('api');
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should use custom error message', async () => {
      mockGuard.user.mockResolvedValue(null);
      
      const middleware = new Authenticate('api', { message: 'Please login' });
      await middleware.handle(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Please login');
    });

    it('should use default guard when not specified', async () => {
      const middleware = new Authenticate();
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockAuth.guard).toHaveBeenCalledWith(null);
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Auth service error');
      mockGuard.user.mockRejectedValue(error);
      
      const middleware = new Authenticate('api');
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should fail when Auth service not available', async () => {
      mockReq.app.locals.Auth = null;
      delete global.Auth;
      
      const middleware = new Authenticate('api');
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Auth service not available');
    });

    it('should use global Auth if not in app.locals', async () => {
      mockReq.app.locals.Auth = null;
      global.Auth = mockAuth;
      
      const middleware = new Authenticate('api');
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockAuth.guard).toHaveBeenCalledWith('api');
      expect(mockNext).toHaveBeenCalledWith();
      
      delete global.Auth;
    });
  });

  describe('authenticate factory', () => {
    it('should create middleware function', () => {
      const middleware = authenticate('api');
      expect(typeof middleware).toBe('function');
    });

    it('should authenticate user', async () => {
      const middleware = authenticate('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should work with default guard', async () => {
      const middleware = authenticate();
      await middleware(mockReq, mockRes, mockNext);

      expect(mockAuth.guard).toHaveBeenCalledWith(null);
    });

    it('should pass options to middleware', async () => {
      mockGuard.user.mockResolvedValue(null);
      const middleware = authenticate('api', { message: 'Login required' });
      await middleware(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Login required');
    });
  });

  describe('optionalAuth factory', () => {
    it('should set user when authenticated', async () => {
      const middleware = optionalAuth('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(mockReq.auth).toEqual(mockGuard);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not fail when user not authenticated', async () => {
      mockGuard.user.mockResolvedValue(null);
      
      const middleware = optionalAuth('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not fail when Auth service not available', async () => {
      mockReq.app.locals.Auth = null;
      delete global.Auth;
      
      const middleware = optionalAuth('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should not fail on authentication errors', async () => {
      mockGuard.user.mockRejectedValue(new Error('Auth error'));
      
      const middleware = optionalAuth('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should use global Auth if available', async () => {
      mockReq.app.locals.Auth = null;
      global.Auth = mockAuth;
      
      const middleware = optionalAuth('api');
      await middleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      
      delete global.Auth;
    });
  });

  describe('integration tests', () => {
    it('should work in middleware chain', async () => {
      const middleware1 = authenticate('api');
      const middleware2 = jest.fn((req, res, next) => next());

      await middleware1(mockReq, mockRes, jest.fn());
      middleware2(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual(mockUser);
      expect(middleware2).toHaveBeenCalled();
    });

    it('should stop chain on authentication failure', async () => {
      mockGuard.user.mockResolvedValue(null);
      
      const middleware1 = authenticate('api');
      const middleware2 = jest.fn((req, res, next) => next());

      await middleware1(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(middleware2).not.toHaveBeenCalled();
    });
  });
});
