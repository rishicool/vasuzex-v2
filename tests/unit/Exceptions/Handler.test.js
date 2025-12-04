import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ExceptionHandler, createExceptionHandler } from '../../../framework/Exceptions/Handler.js';
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  InternalServerError,
  NotFoundError,
} from '../../../framework/Exceptions/index.js';

describe('ExceptionHandler', () => {
  let handler;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    handler = new ExceptionHandler({ debug: false });
    
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

  describe('constructor', () => {
    it('should create handler with default options', () => {
      const handler = new ExceptionHandler();
      
      expect(handler.debug).toBe(false); // NODE_ENV is 'test' in Jest
      expect(handler.logger).toBeDefined();
      expect(handler.reportableErrors).toEqual([]);
      expect(handler.dontReport).toEqual([]);
    });

    it('should create handler with custom options', () => {
      const customLogger = { error: jest.fn() };
      const handler = new ExceptionHandler({
        debug: true,
        logger: customLogger,
        reportableErrors: [InternalServerError],
        dontReport: [NotFoundError],
      });

      expect(handler.debug).toBe(true);
      expect(handler.logger).toBe(customLogger);
      expect(handler.reportableErrors).toEqual([InternalServerError]);
      expect(handler.dontReport).toEqual([NotFoundError]);
    });
  });

  describe('handle', () => {
    it('should handle ApiError and send response', () => {
      const error = new NotFoundError('User not found');
      
      handler.handle(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalled();
      
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('User not found');
      expect(responseData.statusCode).toBe(404);
    });

    it('should handle generic Error and convert to ApiError', () => {
      const error = new Error('Something went wrong');
      
      handler.handle(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
      
      const responseData = mockRes.json.mock.calls[0][0];
      expect(responseData.success).toBe(false);
      expect(responseData.statusCode).toBe(500);
    });
  });

  describe('report', () => {
    it('should log error details', () => {
      const mockLogger = { error: jest.fn() };
      handler.logger = mockLogger;
      
      const error = new NotFoundError('User not found');
      handler.report(error, mockReq);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'User not found',
          statusCode: 404,
          url: '/api/test',
          method: 'GET',
        })
      );
    });

    it('should not report errors in dontReport list', () => {
      const mockLogger = { error: jest.fn() };
      handler.logger = mockLogger;
      handler.dontReport = [NotFoundError];
      
      const error = new NotFoundError('User not found');
      handler.report(error, mockReq);

      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('convertToApiError', () => {
    it('should return ApiError as-is', () => {
      const error = new NotFoundError('User not found');
      const result = handler.convertToApiError(error);

      expect(result).toBe(error);
    });

    it('should convert Joi ValidationError', () => {
      const joiError = {
        name: 'ValidationError',
        message: 'Validation failed',
        details: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Too short' },
        ],
      };

      const result = handler.convertToApiError(joiError);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.statusCode).toBe(422);
      expect(result.errors).toEqual({
        email: 'Invalid email',
        password: 'Too short',
      });
    });

    it('should convert JsonWebTokenError', () => {
      const jwtError = {
        name: 'JsonWebTokenError',
        message: 'jwt malformed',
      };

      const result = handler.convertToApiError(jwtError);

      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.message).toBe('Invalid token');
      expect(result.statusCode).toBe(401);
    });

    it('should convert TokenExpiredError', () => {
      const expiredError = {
        name: 'TokenExpiredError',
        message: 'jwt expired',
      };

      const result = handler.convertToApiError(expiredError);

      expect(result).toBeInstanceOf(AuthenticationError);
      expect(result.message).toBe('Token expired');
      expect(result.statusCode).toBe(401);
    });

    it('should convert generic Error to InternalServerError', () => {
      const error = new Error('Something broke');
      const result = handler.convertToApiError(error);

      expect(result).toBeInstanceOf(InternalServerError);
      expect(result.statusCode).toBe(500);
    });

    it('should include error message in debug mode', () => {
      handler.debug = true;
      const error = new Error('Detailed error');
      const result = handler.convertToApiError(error);

      expect(result.message).toBe('Detailed error');
    });

    it('should hide error message in production mode', () => {
      handler.debug = false;
      const error = new Error('Detailed error');
      const result = handler.convertToApiError(error);

      expect(result.message).toBe('Internal server error');
    });
  });

  describe('formatErrorResponse', () => {
    it('should format error response with required fields', () => {
      const error = new NotFoundError('User not found');
      const response = handler.formatErrorResponse(error, mockReq);

      expect(response).toEqual({
        success: false,
        message: 'User not found',
        statusCode: 404,
        code: 'NOT_FOUND',
        timestamp: expect.any(String),
      });
    });

    it('should include validation errors', () => {
      const errors = { email: 'Invalid' };
      const error = new ValidationError(errors);
      const response = handler.formatErrorResponse(error, mockReq);

      expect(response.errors).toEqual(errors);
    });

    it('should include stack trace in debug mode', () => {
      handler.debug = true;
      const error = new NotFoundError('User not found');
      const response = handler.formatErrorResponse(error, mockReq);

      expect(response.stack).toBeDefined();
      expect(response.path).toBe('/api/test');
      expect(response.method).toBe('GET');
    });

    it('should not include stack trace in production mode', () => {
      handler.debug = false;
      const error = new NotFoundError('User not found');
      const response = handler.formatErrorResponse(error, mockReq);

      expect(response.stack).toBeUndefined();
      expect(response.path).toBeUndefined();
      expect(response.method).toBeUndefined();
    });
  });

  describe('formatJoiErrors', () => {
    it('should format Joi error details to object', () => {
      const details = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['password'], message: 'Too short' },
        { path: ['profile', 'name'], message: 'Required' },
      ];

      const result = handler.formatJoiErrors(details);

      expect(result).toEqual({
        email: 'Invalid email',
        password: 'Too short',
        'profile.name': 'Required',
      });
    });
  });

  describe('shouldReport', () => {
    it('should return true for reportable errors', () => {
      handler.reportableErrors = [InternalServerError];
      const error = new InternalServerError();

      expect(handler.shouldReport(error)).toBe(true);
    });

    it('should return false for non-reportable errors', () => {
      handler.reportableErrors = [InternalServerError];
      const error = new NotFoundError();

      expect(handler.shouldReport(error)).toBe(false);
    });

    it('should trigger reportToExternalService when error should be reported', () => {
      const mockLogger = { error: jest.fn() };
      handler.logger = mockLogger;
      handler.reportableErrors = [InternalServerError];
      handler.reportToExternalService = jest.fn();
      
      const error = new InternalServerError();
      handler.report(error, mockReq);

      expect(handler.reportToExternalService).toHaveBeenCalledWith(error, mockReq);
    });
  });

  describe('shouldntReport', () => {
    it('should return true for errors in dontReport list', () => {
      handler.dontReport = [NotFoundError];
      const error = new NotFoundError();

      expect(handler.shouldntReport(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      handler.dontReport = [NotFoundError];
      const error = new InternalServerError();

      expect(handler.shouldntReport(error)).toBe(false);
    });
  });

  describe('middleware', () => {
    it('should return Express middleware function', () => {
      const middleware = handler.middleware();

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(4); // Error middleware has 4 params
    });

    it('should handle errors when used as middleware', () => {
      const middleware = handler.middleware();
      const error = new NotFoundError('User not found');

      middleware(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('createExceptionHandler', () => {
    it('should create new ExceptionHandler instance', () => {
      const handler = createExceptionHandler({ debug: true });

      expect(handler).toBeInstanceOf(ExceptionHandler);
      expect(handler.debug).toBe(true);
    });
  });

  describe('integration tests', () => {
    it('should handle complete error flow', () => {
      const mockLogger = { error: jest.fn() };
      const handler = new ExceptionHandler({ 
        debug: false,
        logger: mockLogger,
      });

      const error = new ValidationError(
        { email: 'Invalid email' },
        'Validation failed'
      );

      handler.handle(error, mockReq, mockRes, mockNext);

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          statusCode: 422,
          code: 'VALIDATION_ERROR',
          errors: { email: 'Invalid email' },
        })
      );
    });
  });
});
