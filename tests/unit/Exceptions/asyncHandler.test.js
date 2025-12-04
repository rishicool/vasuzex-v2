import { describe, it, expect, jest } from '@jest/globals';
import { asyncHandler, asyncMiddleware, catchAsync } from '../../../framework/Exceptions/asyncHandler.js';

describe('asyncHandler', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { body: {}, params: {} };
    mockRes = { 
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('asyncHandler', () => {
    it('should handle successful async function', async () => {
      const asyncFn = async (req, res) => {
        res.json({ success: true });
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Test error');
      const asyncFn = async (req, res) => {
        throw error;
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should handle rejected promises', async () => {
      const error = new Error('Promise rejection');
      const asyncFn = (req, res) => {
        return Promise.reject(error);
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      // Wait for promise to reject
      await new Promise(resolve => setImmediate(resolve));

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should pass through request, response, and next', async () => {
      const asyncFn = jest.fn(async (req, res, next) => {
        expect(req).toBe(mockReq);
        expect(res).toBe(mockRes);
        expect(next).toBe(mockNext);
      });

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should handle errors thrown inside async handler', async () => {
      const error = new Error('Async error');
      const asyncFn = async (req, res, next) => {
        throw error;
      };

      const wrapped = asyncHandler(asyncFn);
      
      // Call wrapped function
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle async functions that call next', async () => {
      const asyncFn = async (req, res, next) => {
        next();
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('asyncMiddleware', () => {
    it('should handle successful async middleware', async () => {
      const middleware = async (req, res, next) => {
        req.user = { id: 1 };
        next();
      };

      const wrapped = asyncMiddleware(middleware);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockReq.user).toEqual({ id: 1 });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should catch middleware errors', async () => {
      const error = new Error('Middleware error');
      const middleware = async (req, res, next) => {
        throw error;
      };

      const wrapped = asyncMiddleware(middleware);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should work identically to asyncHandler', async () => {
      const error = new Error('Test error');
      const fn = async (req, res) => {
        throw error;
      };

      const wrappedHandler = asyncHandler(fn);
      const wrappedMiddleware = asyncMiddleware(fn);

      await wrappedHandler(mockReq, mockRes, mockNext);
      const handlerCalls = mockNext.mock.calls.length;

      mockNext.mockClear();

      await wrappedMiddleware(mockReq, mockRes, mockNext);
      const middlewareCalls = mockNext.mock.calls.length;

      expect(handlerCalls).toBe(middlewareCalls);
    });
  });

  describe('catchAsync', () => {
    it('should be an alias for asyncHandler', () => {
      expect(catchAsync).toBe(asyncHandler);
    });

    it('should work the same as asyncHandler', async () => {
      const asyncFn = async (req, res) => {
        res.json({ success: true });
      };

      const wrapped = catchAsync(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('real-world usage examples', () => {
    it('should handle database queries', async () => {
      const findUser = async (id) => {
        if (id === 999) {
          throw new Error('User not found');
        }
        return { id, name: 'John' };
      };

      const controller = async (req, res) => {
        const user = await findUser(req.params.id);
        res.json(user);
      };

      const wrapped = asyncHandler(controller);

      // Success case
      mockReq.params.id = 1;
      await wrapped(mockReq, mockRes, mockNext);
      
      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockRes.json).toHaveBeenCalledWith({ id: 1, name: 'John' });

      mockNext.mockClear();
      mockRes.json.mockClear();

      // Error case
      mockReq.params.id = 999;
      await wrapped(mockReq, mockRes, mockNext);
      
      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle multiple async operations', async () => {
      const fetchUserData = async (id) => ({ id, name: 'John' });
      const fetchUserPosts = async (id) => [{ id: 1, title: 'Post 1' }];

      const controller = async (req, res) => {
        const user = await fetchUserData(req.params.id);
        const posts = await fetchUserPosts(req.params.id);
        res.json({ user, posts });
      };

      const wrapped = asyncHandler(controller);
      mockReq.params.id = 1;

      await wrapped(mockReq, mockRes, mockNext);
      
      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockRes.json).toHaveBeenCalledWith({
        user: { id: 1, name: 'John' },
        posts: [{ id: 1, title: 'Post 1' }],
      });
    });

    it('should preserve error stack trace', async () => {
      const error = new Error('Custom error');
      const asyncFn = async (req, res) => {
        throw error;
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      const passedError = mockNext.mock.calls[0][0];
      expect(passedError).toBe(error);
      expect(passedError.stack).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined returns', async () => {
      const asyncFn = async (req, res) => {
        return null;
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle functions that return non-promises', async () => {
      const syncFn = (req, res) => {
        res.json({ success: true });
      };

      const wrapped = asyncHandler(syncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle already resolved promises', async () => {
      const asyncFn = async (req, res) => {
        return Promise.resolve(res.json({ success: true }));
      };

      const wrapped = asyncHandler(asyncFn);
      await wrapped(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
