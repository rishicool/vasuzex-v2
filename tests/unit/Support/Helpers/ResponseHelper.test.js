/**
 * ResponseHelper Tests
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  success,
  error,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError,
  paginated,
  custom,
  ResponseHelper,
} from '../../../../framework/Support/Helpers/ResponseHelper.js';

describe('ResponseHelper', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    it('should return success response with data', () => {
      const data = { id: 1, name: 'Test' };
      success(mockRes, data, 'Success message');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Success message',
          data,
        })
      );
    });

    it('should include timestamp', () => {
      success(mockRes, {});
      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty('timestamp');
    });

    it('should handle null data', () => {
      success(mockRes, null);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: null,
        })
      );
    });
  });

  describe('error', () => {
    it('should return error response', () => {
      error(mockRes, 'Error occurred', 500, { details: 'test' });

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error occurred',
          error: { details: 'test' },
        })
      );
    });

    it('should handle error without details', () => {
      error(mockRes, 'Error occurred', 500);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.error).toBeUndefined();
    });
  });

  describe('created', () => {
    it('should return 201 created response', () => {
      const data = { id: 1 };
      created(mockRes, data, 'Resource created');

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Resource created',
          data,
        })
      );
    });
  });

  describe('noContent', () => {
    it('should return 204 no content', () => {
      noContent(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });
  });

  describe('badRequest', () => {
    it('should return 400 bad request', () => {
      badRequest(mockRes, 'Invalid request', { field: 'error' });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Invalid request',
          error: { field: 'error' },
        })
      );
    });
  });

  describe('unauthorized', () => {
    it('should return 401 unauthorized', () => {
      unauthorized(mockRes, 'Authentication required');

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Authentication required',
        })
      );
    });

    it('should use default message', () => {
      unauthorized(mockRes);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.message).toBe('Unauthorized');
    });
  });

  describe('forbidden', () => {
    it('should return 403 forbidden', () => {
      forbidden(mockRes, 'Access denied');

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Access denied',
        })
      );
    });

    it('should use default message', () => {
      forbidden(mockRes);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.message).toBe('Forbidden');
    });
  });

  describe('notFound', () => {
    it('should return 404 not found', () => {
      notFound(mockRes, 'Resource not found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource not found',
        })
      );
    });

    it('should use default message', () => {
      notFound(mockRes);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.message).toBe('Resource not found');
    });
  });

  describe('conflict', () => {
    it('should return 409 conflict', () => {
      conflict(mockRes, 'Resource already exists', { email: 'exists' });

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Resource already exists',
          error: { email: 'exists' },
        })
      );
    });
  });

  describe('validationError', () => {
    it('should return 422 validation error', () => {
      const errors = {
        email: 'Invalid email',
        password: 'Too short',
      };

      validationError(mockRes, errors, 'Validation failed');

      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Validation failed',
          errors,
        })
      );
    });

    it('should use default message', () => {
      validationError(mockRes, {});
      const call = mockRes.json.mock.calls[0][0];
      expect(call.message).toBe('Validation failed');
    });
  });

  describe('serverError', () => {
    it('should return 500 server error', () => {
      serverError(mockRes, 'Internal error', { stack: 'trace' });

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Internal error',
          error: { stack: 'trace' },
        })
      );
    });

    it('should use default message', () => {
      serverError(mockRes);
      const call = mockRes.json.mock.calls[0][0];
      expect(call.message).toBe('Internal server error');
    });
  });

  describe('paginated', () => {
    it('should return paginated response', () => {
      const items = [1, 2, 3];
      const pagination = {
        page: 1,
        perPage: 10,
        total: 100,
        totalPages: 10,
      };

      paginated(mockRes, items, pagination);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: items,
          pagination,
        })
      );
    });
  });

  describe('custom', () => {
    it('should return custom response', () => {
      const customData = {
        success: true,
        customField: 'value',
      };

      custom(mockRes, 201, customData);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(customData);
    });
  });

  describe('ResponseHelper class', () => {
    it('should provide static methods', () => {
      ResponseHelper.success(mockRes, { test: 'data' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should have all response methods', () => {
      expect(ResponseHelper.success).toBeDefined();
      expect(ResponseHelper.error).toBeDefined();
      expect(ResponseHelper.created).toBeDefined();
      expect(ResponseHelper.notFound).toBeDefined();
      expect(ResponseHelper.validationError).toBeDefined();
      expect(ResponseHelper.paginated).toBeDefined();
    });
  });
});
