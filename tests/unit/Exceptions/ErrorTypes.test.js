import { describe, it, expect } from '@jest/globals';
import {
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
} from '../../../framework/Exceptions/ErrorTypes.js';
import { ApiError } from '../../../framework/Exceptions/ApiError.js';

describe('ErrorTypes', () => {
  describe('ValidationError', () => {
    it('should create validation error with 422 status', () => {
      const errors = { email: 'Invalid email' };
      const error = new ValidationError(errors);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept custom message', () => {
      const error = new ValidationError({}, 'Custom validation message');
      expect(error.message).toBe('Custom validation message');
    });
  });

  describe('BadRequestError', () => {
    it('should create bad request error with 400 status', () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should accept custom message and errors', () => {
      const errors = { field: 'Invalid' };
      const error = new BadRequestError('Custom message', errors);
      
      expect(error.message).toBe('Custom message');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with 401 status', () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should accept custom message', () => {
      const error = new UnauthorizedError('Token required');
      expect(error.message).toBe('Token required');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with 403 status', () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Access denied');
      expect(error.message).toBe('Access denied');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      expect(error.message).toBe('User not found');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Resource conflict');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('should accept custom message', () => {
      const error = new ConflictError('Email already exists');
      expect(error.message).toBe('Email already exists');
    });
  });

  describe('TooManyRequestsError', () => {
    it('should create too many requests error with 429 status', () => {
      const error = new TooManyRequestsError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('TOO_MANY_REQUESTS');
    });

    it('should accept custom message', () => {
      const error = new TooManyRequestsError('Rate limit exceeded');
      expect(error.message).toBe('Rate limit exceeded');
    });
  });

  describe('InternalServerError', () => {
    it('should create internal server error with 500 status', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should accept custom message', () => {
      const error = new InternalServerError('Database connection failed');
      expect(error.message).toBe('Database connection failed');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with 503 status', () => {
      const error = new ServiceUnavailableError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Service unavailable');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should accept custom message', () => {
      const error = new ServiceUnavailableError('Maintenance mode');
      expect(error.message).toBe('Maintenance mode');
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with 500 status', () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Database error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });

    it('should accept custom message and errors', () => {
      const dbErrors = { query: 'Syntax error' };
      const error = new DatabaseError('Query failed', dbErrors);
      
      expect(error.message).toBe('Query failed');
      expect(error.errors).toEqual(dbErrors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Authentication failed');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.message).toBe('Invalid credentials');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Authorization failed');
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('All error types', () => {
    it('should all be operational errors by default', () => {
      const errors = [
        new ValidationError({}),
        new BadRequestError(),
        new UnauthorizedError(),
        new ForbiddenError(),
        new NotFoundError(),
        new ConflictError(),
        new TooManyRequestsError(),
        new InternalServerError(),
        new ServiceUnavailableError(),
        new DatabaseError(),
        new AuthenticationError(),
        new AuthorizationError(),
      ];

      errors.forEach((error) => {
        expect(error.isOperationalError()).toBe(true);
      });
    });

    it('should all have proper JSON serialization', () => {
      const error = new NotFoundError('User not found');
      const json = error.toJSON();

      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('statusCode');
      expect(json).toHaveProperty('code');
      expect(json).toHaveProperty('timestamp');
    });
  });
});
