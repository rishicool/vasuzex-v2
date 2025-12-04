/**
 * Validation Factory
 * Laravel-inspired validation factory
 */

import Joi from 'joi';
import { IndianValidators } from './IndianValidators.js';

export class ValidationFactory {
  constructor() {
    this.extensions = {};
    this.customMessages = {};
  }

  /**
   * Create a new Validator instance
   */
  make(data, rules, messages = {}, customAttributes = {}) {
    return new Validator(data, rules, { ...this.customMessages, ...messages }, customAttributes, this.extensions);
  }

  /**
   * Register a custom validation rule
   */
  extend(name, callback, message = null) {
    this.extensions[name] = callback;
    
    if (message) {
      this.customMessages[name] = message;
    }

    return this;
  }

  /**
   * Set global custom messages
   */
  setMessages(messages) {
    this.customMessages = { ...this.customMessages, ...messages };
    return this;
  }
}

export class Validator {
  constructor(data, rules, messages = {}, customAttributes = {}, extensions = {}) {
    this.data = data;
    this.rules = rules;
    this.messages = messages;
    this.customAttributes = customAttributes;
    this.extensions = extensions;
    this.errors = {};
    this.validated = {};
  }

  /**
   * Run the validator
   */
  async validate() {
    const schema = this.buildJoiSchema();
    
    try {
      this.validated = await schema.validateAsync(this.data, {
        abortEarly: false,
        stripUnknown: true
      });
      
      return this.validated;
    } catch (error) {
      if (error.isJoi) {
        this.errors = this.formatJoiErrors(error.details);
        throw new ValidationException('Validation failed', this.errors);
      }
      throw error;
    }
  }

  /**
   * Check if validation passes
   */
  async passes() {
    try {
      await this.validate();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if validation fails
   */
  async fails() {
    return !(await this.passes());
  }

  /**
   * Get validated data
   */
  validated() {
    return this.validated;
  }

  /**
   * Get validation errors
   */
  errors() {
    return this.errors;
  }

  /**
   * Build Joi schema from Laravel-style rules
   */
  buildJoiSchema() {
    const schemaFields = {};

    for (const [field, fieldRules] of Object.entries(this.rules)) {
      let schema = Joi.any();
      const rulesArray = typeof fieldRules === 'string' ? fieldRules.split('|') : fieldRules;

      for (const rule of rulesArray) {
        schema = this.applyRule(schema, rule, field);
      }

      schemaFields[field] = schema;
    }

    return Joi.object(schemaFields);
  }

  /**
   * Apply a single rule to Joi schema
   */
  applyRule(schema, rule, field) {
    const [ruleName, ...params] = rule.split(':');
    const param = params.join(':');

    switch (ruleName) {
      case 'required':
        return schema.required();
      
      case 'optional':
      case 'nullable':
        return schema.optional().allow(null, '');
      
      case 'string':
        return Joi.string();
      
      case 'number':
      case 'numeric':
        return Joi.number();
      
      case 'integer':
        return Joi.number().integer();
      
      case 'boolean':
      case 'bool':
        return Joi.boolean();
      
      case 'email':
        return Joi.string().email();
      
      case 'url':
        return Joi.string().uri();
      
      case 'min':
        return schema.min(parseInt(param));
      
      case 'max':
        return schema.max(parseInt(param));
      
      case 'between':
        const [min, max] = param.split(',');
        return schema.min(parseInt(min)).max(parseInt(max));
      
      case 'in':
        const values = param.split(',');
        return schema.valid(...values);
      
      case 'not_in':
        const invalidValues = param.split(',');
        return schema.invalid(...invalidValues);
      
      case 'regex':
        return schema.pattern(new RegExp(param));
      
      case 'alpha':
        return schema.pattern(/^[a-zA-Z]+$/);
      
      case 'alpha_num':
        return schema.pattern(/^[a-zA-Z0-9]+$/);
      
      case 'alpha_dash':
        return schema.pattern(/^[a-zA-Z0-9_-]+$/);
      
      case 'array':
        return Joi.array();
      
      case 'object':
        return Joi.object();
      
      case 'date':
        return Joi.date();
      
      case 'uuid':
        return Joi.string().uuid();
      
      case 'ip':
        return Joi.string().ip();
      
      case 'json':
        return Joi.string().custom((value, helpers) => {
          try {
            JSON.parse(value);
            return value;
          } catch {
            return helpers.error('any.invalid');
          }
        });
      
      // Indian validators
      case 'indian_phone':
      case 'phone':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.phone(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'pincode':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.pincode(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'ifsc':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.ifsc(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'pan':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.pan(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'aadhaar':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.aadhaar(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'gstin':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.gstin(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'vehicle_number':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.vehicleNumber(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'upi':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.upi(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'passport':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.passport(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      case 'voter_id':
        return schema.custom((value, helpers) => {
          const result = IndianValidators.voterId(value);
          return result.isValid ? value : helpers.error('any.invalid', { message: result.message });
        });
      
      // Custom extensions
      default:
        if (this.extensions[ruleName]) {
          return schema.custom((value, helpers) => {
            const result = this.extensions[ruleName](value, param, this.data);
            return result ? value : helpers.error('any.invalid');
          });
        }
        return schema;
    }
  }

  /**
   * Format Joi errors to Laravel-style errors
   */
  formatJoiErrors(details) {
    const errors = {};

    for (const detail of details) {
      const field = detail.path.join('.');
      const message = this.messages[`${field}.${detail.type}`] 
        || this.messages[detail.type]
        || detail.message;

      if (!errors[field]) {
        errors[field] = [];
      }

      errors[field].push(message);
    }

    return errors;
  }
}

export class ValidationException extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'ValidationException';
    this.errors = errors;
  }

  getErrors() {
    return this.errors;
  }
}

export default ValidationFactory;
