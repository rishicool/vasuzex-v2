/**
 * Validator Tests
 * 
 * Comprehensive test suite for the Validator class covering:
 * - Data validation with Joi schemas
 * - Error formatting and handling
 * - Validation middleware
 * - Schema creation with make()
 * - Common validation rules
 * - Integration with Express req/res
 * 
 * Test Coverage:
 * - validate() method with various schemas
 * - middleware() factory
 * - make() schema builder
 * - Common rules: string, number, email, uuid, etc.
 * - Error handling and formatting
 * 
 * @total-tests: 35
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Validator } from '../../../framework/Validation/Validator.js';
import Joi from 'joi';

describe('Validator', () => {
  describe('validate()', () => {
    test('should validate valid data against schema', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      const data = { name: 'John', age: 30 };
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeNull();
      expect(value).toEqual(data);
    });

    test('should return errors for invalid data', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      const data = { name: 'John' }; // Missing age
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeDefined();
      expect(error.age).toBeDefined();
      expect(value).toBeNull();
    });

    test('should format multiple errors', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        age: Joi.number().required()
      });

      const data = { name: 'John' }; // Missing email and age
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeDefined();
      expect(error.email).toBeDefined();
      expect(error.age).toBeDefined();
      expect(value).toBeNull();
    });

    test('should strip unknown fields', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });

      const data = { name: 'John', extra: 'field' };
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeNull();
      expect(value).toEqual({ name: 'John' });
      expect(value.extra).toBeUndefined();
    });

    test('should validate nested objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required()
        }).required()
      });

      const data = {
        user: {
          name: 'John',
          email: 'john@example.com'
        }
      };

      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeNull();
      expect(value).toEqual(data);
    });

    test('should format nested validation errors with dot notation', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required()
        }).required()
      });

      const data = {
        user: {
          name: 'John'
          // Missing email
        }
      };

      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeDefined();
      expect(error['user.email']).toBeDefined();
      expect(value).toBeNull();
    });

    test('should validate arrays', () => {
      const schema = Joi.object({
        tags: Joi.array().items(Joi.string()).required()
      });

      const data = { tags: ['tag1', 'tag2', 'tag3'] };
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeNull();
      expect(value).toEqual(data);
    });

    test('should return error for invalid array items', () => {
      const schema = Joi.object({
        tags: Joi.array().items(Joi.string()).required()
      });

      const data = { tags: ['tag1', 123, 'tag3'] }; // 123 is not a string
      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeDefined();
      expect(value).toBeNull();
    });
  });

  describe('middleware()', () => {
    test('should create validation middleware', () => {
      const schema = Joi.object({ name: Joi.string().required() });
      const middleware = Validator.middleware(schema);

      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // (req, res, next)
    });

    test('should call next() for valid data', async () => {
      const schema = Joi.object({ name: Joi.string().required() });
      const middleware = Validator.middleware(schema);

      const req = { body: { name: 'John' }, query: {}, params: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 422 error for invalid data', () => {
      const schema = Joi.object({ name: Joi.string().required() });
      const middleware = Validator.middleware(schema);

      const req = { body: {}, query: {}, params: {} }; // Missing name
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        errors: expect.any(Object)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should validate data from body, query, and params', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        id: Joi.string().required(),
        search: Joi.string().required()
      });
      const middleware = Validator.middleware(schema);

      const req = {
        body: { name: 'John' },
        query: { search: 'test' },
        params: { id: '123' }
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: 'John', id: '123', search: 'test' });
    });

    test('should update req.body with validated data', () => {
      const schema = Joi.object({
        name: Joi.string().required()
      });
      const middleware = Validator.middleware(schema);

      const req = {
        body: { name: 'John', extra: 'field' },
        query: {},
        params: {}
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).toEqual({ name: 'John' }); // extra field stripped
    });

    test('should include validation errors in response', () => {
      const schema = Joi.object({
        email: Joi.string().email().required(),
        age: Joi.number().required()
      });
      const middleware = Validator.middleware(schema);

      const req = { body: { email: 'invalid' }, query: {}, params: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        errors: expect.objectContaining({
          email: expect.any(String),
          age: expect.any(String)
        })
      });
    });
  });

  describe('make()', () => {
    test('should create Joi schema from rules', () => {
      const schema = Validator.make({
        name: Joi.string().required(),
        age: Joi.number().required()
      });

      expect(schema.validate).toBeDefined();
      expect(typeof schema.validate).toBe('function');
    });

    test('should create usable validation schema', () => {
      const schema = Validator.make({
        name: Joi.string().required(),
        email: Joi.string().email().required()
      });

      const { error, value } = Validator.validate({ name: 'John', email: 'john@example.com' }, schema);

      expect(error).toBeNull();
      expect(value).toEqual({ name: 'John', email: 'john@example.com' });
    });
  });

  describe('Common Validation Rules', () => {
    test('should have string rule', () => {
      const rule = Validator.rules.string();
      expect(rule.validate).toBeDefined();
    });

    test('should have number rule', () => {
      const rule = Validator.rules.number();
      expect(rule.validate).toBeDefined();
    });

    test('should have boolean rule', () => {
      const rule = Validator.rules.boolean();
      expect(rule.validate).toBeDefined();
    });

    test('should have email rule', () => {
      const rule = Validator.rules.email();
      const { error } = rule.validate('test@example.com');
      expect(error).toBeUndefined();
    });

    test('should have uuid rule', () => {
      const rule = Validator.rules.uuid();
      const { error } = rule.validate('123e4567-e89b-12d3-a456-426614174000');
      expect(error).toBeUndefined();
    });

    test('should have date rule', () => {
      const rule = Validator.rules.date();
      expect(rule.validate).toBeDefined();
    });

    test('should have array rule', () => {
      const rule = Validator.rules.array();
      const { error } = rule.validate([1, 2, 3]);
      expect(error).toBeUndefined();
    });

    test('should have object rule', () => {
      const rule = Validator.rules.object();
      const { error } = rule.validate({ key: 'value' });
      expect(error).toBeUndefined();
    });

    test('should have min rule with limit', () => {
      const rule = Validator.rules.min(5);
      const { error } = rule.validate('hello');
      expect(error).toBeUndefined();
    });

    test('should have max rule with limit', () => {
      const rule = Validator.rules.max(10);
      const { error } = rule.validate('hello');
      expect(error).toBeUndefined();
    });

    test('should have pattern rule', () => {
      const rule = Validator.rules.pattern(/^[a-z]+$/);
      const { error } = rule.validate('hello');
      expect(error).toBeUndefined();
    });
  });

  describe('Integration', () => {
    test('should work with complex validation scenario', () => {
      const schema = Validator.make({
        user: Joi.object({
          name: Joi.string().min(3).max(50).required(),
          email: Joi.string().email().required(),
          age: Joi.number().min(18).max(120).required(),
          roles: Joi.array().items(Joi.string()).min(1).required()
        }).required(),
        settings: Joi.object({
          notifications: Joi.boolean().default(true),
          theme: Joi.string().valid('light', 'dark').default('light')
        }).optional()
      });

      const data = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30,
          roles: ['admin', 'user']
        },
        settings: {
          notifications: false,
          theme: 'dark'
        }
      };

      const { error, value } = Validator.validate(data, schema);

      expect(error).toBeNull();
      expect(value.user.name).toBe('John Doe');
      expect(value.settings.theme).toBe('dark');
    });

    test('should handle validation with custom error messages', () => {
      const schema = Joi.object({
        password: Joi.string().min(8).required().messages({
          'string.min': 'Password must be at least 8 characters long',
          'any.required': 'Password is required'
        })
      });

      const { error } = Validator.validate({ password: '123' }, schema);

      expect(error).toBeDefined();
      expect(error.password).toContain('at least 8 characters');
    });
  });
});
