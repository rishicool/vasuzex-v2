import { describe, it, expect, beforeEach } from '@jest/globals';
import { ApiError } from '../../../framework/Exceptions/ApiError.js';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an error with default values', () => {
      const error = new ApiError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('An error occurred');
      expect(error.statusCode).toBe(500);
      expect(error.errors).toBeNull();
      expect(error.code).toBe('ApiError');
      expect(error.isOperational).toBe(true);
      expect(error.timestamp).toBeDefined();
    });

    it('should create an error with custom values', () => {
      const customErrors = { field: 'error' };
      const error = new ApiError(
        'Custom error',
        400,
        customErrors,
        'CUSTOM_CODE',
        false
      );

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(customErrors);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.isOperational).toBe(false);
    });

    it('should use constructor name as default code', () => {
      const error = new ApiError('Test error', 400);
      expect(error.code).toBe('ApiError');
    });

    it('should have a stack trace', () => {
      const error = new ApiError();
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });

    it('should set error name to constructor name', () => {
      const error = new ApiError();
      expect(error.name).toBe('ApiError');
    });

    it('should set timestamp to ISO string', () => {
      const before = new Date().toISOString();
      const error = new ApiError();
      const after = new Date().toISOString();

      expect(error.timestamp).toBeDefined();
      expect(error.timestamp >= before).toBe(true);
      expect(error.timestamp <= after).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should convert error to JSON format', () => {
      const error = new ApiError('Test error', 400, { field: 'error' }, 'TEST_CODE');
      const json = error.toJSON();

      expect(json).toEqual({
        success: false,
        message: 'Test error',
        statusCode: 400,
        code: 'TEST_CODE',
        timestamp: error.timestamp,
        errors: { field: 'error' },
      });
    });

    it('should omit errors field if no errors', () => {
      const error = new ApiError('Test error', 400);
      const json = error.toJSON();

      expect(json).toEqual({
        success: false,
        message: 'Test error',
        statusCode: 400,
        code: 'ApiError',
        timestamp: error.timestamp,
      });
    });

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new ApiError('Test error');
      const json = error.toJSON();

      expect(json.stack).toBeDefined();
      expect(json.stack).toContain('ApiError');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new ApiError('Test error');
      const json = error.toJSON();

      expect(json.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('getStatusCode', () => {
    it('should return the status code', () => {
      const error = new ApiError('Test', 404);
      expect(error.getStatusCode()).toBe(404);
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      const error = new ApiError('Test', 400, null, null, true);
      expect(error.isOperationalError()).toBe(true);
    });

    it('should return false for non-operational errors', () => {
      const error = new ApiError('Test', 500, null, null, false);
      expect(error.isOperationalError()).toBe(false);
    });

    it('should default to operational', () => {
      const error = new ApiError('Test');
      expect(error.isOperationalError()).toBe(true);
    });
  });

  describe('inheritance', () => {
    it('should be instanceof Error', () => {
      const error = new ApiError();
      expect(error instanceof Error).toBe(true);
    });

    it('should be instanceof ApiError', () => {
      const error = new ApiError();
      expect(error instanceof ApiError).toBe(true);
    });
  });

  describe('error properties', () => {
    it('should maintain all properties after creation', () => {
      const errors = { email: 'Invalid email', password: 'Too short' };
      const error = new ApiError('Validation failed', 422, errors, 'VALIDATION');

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.code).toBe('VALIDATION');
      expect(error.name).toBe('ApiError');
      expect(error.isOperational).toBe(true);
    });
  });
});
