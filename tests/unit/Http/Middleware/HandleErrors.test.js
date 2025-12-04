import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  handleErrors,
  notFoundHandler,
  createExceptionHandler,
} from '../../../../framework/Http/Middleware/HandleErrors.js';
import {
  NotFoundError,
  ValidationError,
} from '../../../../framework/Exceptions/index.js';

describe('HandleErrors Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      url: '/api/test',
      method: 'GET',
      ip: '127.0.0.1',
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('handleErrors', () => {
    it('should create error handler middleware', () => {
      const middleware = handleErrors();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(4); // Error middleware has 4 params
    });

    it('should handle errors', () => {
      const middleware = handleErrors({ debug: false });
      const error = new ValidationError({ email: 'Invalid' });

      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should pass options to exception handler', () => {
      const middleware = handleErrors({ debug: true });
      const error = new NotFoundError('Not found');

      middleware(error, mockReq, mockRes, mockNext);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveProperty('stack'); // Debug mode includes stack
    });
  });

  describe('notFoundHandler', () => {
    it('should create not found middleware', () => {
      const middleware = notFoundHandler();
      expect(typeof middleware).toBe('function');
    });

    it('should create NotFoundError', () => {
      const middleware = notFoundHandler();
      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
      const error = mockNext.mock.calls[0][0];
      expect(error.message).toContain('GET /api/test');
    });

    it('should use custom message', () => {
      const middleware = notFoundHandler({ message: 'Page not found' });
      middleware(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Page not found');
    });
  });

  describe('createExceptionHandler', () => {
    it('should create ExceptionHandler instance', () => {
      const handler = createExceptionHandler({ debug: true });
      expect(handler).toBeDefined();
      expect(handler.debug).toBe(true);
    });

    it('should create handler with custom options', () => {
      const options = {
        debug: false,
        dontReport: [NotFoundError],
        reportableErrors: [],
      };

      const handler = createExceptionHandler(options);
      expect(handler.debug).toBe(false);
      expect(handler.dontReport).toEqual([NotFoundError]);
    });
  });

  describe('integration tests', () => {
    it('should work in middleware chain', () => {
      const notFound = notFoundHandler();
      const errorHandler = handleErrors();

      // Simulate 404
      notFound(mockReq, mockRes, (error) => {
        // Error handler receives the error
        errorHandler(error, mockReq, mockRes, mockNext);
      });

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
