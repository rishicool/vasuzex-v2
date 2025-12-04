import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import Joi from 'joi';
import {
  ValidateRequest,
  validateRequest,
  validateBody,
  validateQuery,
  validateParams,
  CommonValidators,
} from '../../../../framework/Http/Middleware/ValidateRequest.js';
import { ValidationError } from '../../../../framework/Exceptions/index.js';

describe('ValidateRequest Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('ValidateRequest class', () => {
    it('should create middleware instance', () => {
      const schema = Joi.object({ name: Joi.string() });
      const middleware = new ValidateRequest(schema);
      
      expect(middleware.schema).toBe(schema);
      expect(middleware.options).toBeDefined();
    });

    it('should validate request body successfully', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      });

      mockReq.body = {
        email: 'test@example.com',
        password: 'secret123',
      };

      const middleware = new ValidateRequest(schema);
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body).toEqual({
        email: 'test@example.com',
        password: 'secret123',
      });
    });

    it('should fail validation with errors', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      });

      mockReq.body = {
        email: 'invalid-email',
        password: '123',
      };

      const middleware = new ValidateRequest(schema);
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const error = mockNext.mock.calls[0][0];
      expect(error.errors).toHaveProperty('email');
      expect(error.errors).toHaveProperty('password');
    });

    it('should strip unknown fields by default', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockReq.body = {
        name: 'John',
        unknown: 'field',
      };

      const middleware = new ValidateRequest(schema);
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockReq.body).toEqual({ name: 'John' });
      expect(mockReq.body.unknown).toBeUndefined();
    });

    it('should validate query parameters', async () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1),
      });

      mockReq.query = { page: '2' };

      const middleware = new ValidateRequest(schema, { source: 'query' });
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query.page).toBe(2); // Converted to number
    });

    it('should validate route params', async () => {
      const schema = Joi.object({
        id: Joi.string().uuid().required(),
      });

      mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

      const middleware = new ValidateRequest(schema, { source: 'params' });
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should validate all sources', async () => {
      const schema = Joi.object({
        body: Joi.object({ name: Joi.string() }),
        query: Joi.object({ page: Joi.number() }),
        params: Joi.object({ id: Joi.string() }),
      });

      mockReq.body = { name: 'John' };
      mockReq.query = { page: '1' };
      mockReq.params = { id: '123' };

      const middleware = new ValidateRequest(schema, { source: 'all' });
      await middleware.handle(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should use custom error message', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      mockReq.body = {};

      const middleware = new ValidateRequest(schema, {
        message: 'Invalid input data',
      });
      await middleware.handle(mockReq, mockRes, mockNext);

      const error = mockNext.mock.calls[0][0];
      expect(error.message).toBe('Invalid input data');
    });

    it('should format Joi errors correctly', () => {
      const schema = Joi.object({ name: Joi.string() });
      const middleware = new ValidateRequest(schema);

      const details = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['profile', 'age'], message: 'Must be a number' },
      ];

      const formatted = middleware.formatJoiErrors(details);

      expect(formatted).toEqual({
        email: 'Invalid email',
        'profile.age': 'Must be a number',
      });
    });
  });

  describe('validateRequest factory', () => {
    it('should create middleware function', () => {
      const schema = Joi.object({ name: Joi.string() });
      const middleware = validateRequest(schema);
      
      expect(typeof middleware).toBe('function');
    });

    it('should validate request', async () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
      });

      mockReq.body = { email: 'test@example.com' };

      const middleware = validateRequest(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateBody factory', () => {
    it('should validate request body', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      mockReq.body = { name: 'John' };

      const middleware = validateBody(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateQuery factory', () => {
    it('should validate query parameters', async () => {
      const schema = Joi.object({
        search: Joi.string().required(),
      });

      mockReq.query = { search: 'test' };

      const middleware = validateQuery(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('validateParams factory', () => {
    it('should validate route parameters', async () => {
      const schema = Joi.object({
        id: Joi.number().required(),
      });

      mockReq.params = { id: '123' };

      const middleware = validateParams(schema);
      await middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.params.id).toBe(123);
    });
  });

  describe('CommonValidators', () => {
    describe('id validator', () => {
      it('should validate UUID', async () => {
        mockReq.params = { id: '123e4567-e89b-12d3-a456-426614174000' };

        const middleware = CommonValidators.id();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should validate MongoDB ObjectId', async () => {
        mockReq.params = { id: '507f1f77bcf86cd799439011' };

        const middleware = CommonValidators.id();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should fail for invalid ID', async () => {
        mockReq.params = { id: 'invalid' };

        const middleware = CommonValidators.id();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });

      it('should validate custom field name', async () => {
        mockReq.params = { userId: '123e4567-e89b-12d3-a456-426614174000' };

        const middleware = CommonValidators.id('userId');
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });
    });

    describe('pagination validator', () => {
      it('should validate pagination params', async () => {
        mockReq.query = {
          page: '2',
          limit: '20',
          sort: 'name',
          order: 'asc',
        };

        const middleware = CommonValidators.pagination();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
        expect(mockReq.query.page).toBe(2);
        expect(mockReq.query.limit).toBe(20);
      });

      it('should use default values', async () => {
        mockReq.query = {};

        const middleware = CommonValidators.pagination();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockReq.query.page).toBe(1);
        expect(mockReq.query.limit).toBe(15);
        expect(mockReq.query.sort).toBe('created_at');
        expect(mockReq.query.order).toBe('desc');
      });

      it('should enforce min/max limits', async () => {
        mockReq.query = { page: '0', limit: '200' };

        const middleware = CommonValidators.pagination();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('email validator', () => {
      it('should validate email', async () => {
        mockReq.body = { email: 'test@example.com' };

        const middleware = CommonValidators.email();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should fail for invalid email', async () => {
        mockReq.body = { email: 'invalid' };

        const middleware = CommonValidators.email();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });

    describe('search validator', () => {
      it('should validate search query', async () => {
        mockReq.query = { q: 'search term' };

        const middleware = CommonValidators.search();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should validate with fields', async () => {
        mockReq.query = {
          q: 'search',
          fields: ['name', 'email'],
        };

        const middleware = CommonValidators.search();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith();
      });

      it('should fail for missing query', async () => {
        mockReq.query = {};

        const middleware = CommonValidators.search();
        await middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      });
    });
  });
});
