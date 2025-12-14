import Joi from 'joi';

/**
 * Validator - Laravel-style validation using Joi
 */
export class Validator {
  /**
   * Validate data against schema
   */
  static validate(data, schema) {
    const result = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (result.error) {
      const errors = result.error.details.reduce((acc, detail) => {
        const key = detail.path.join('.');
        acc[key] = detail.message;
        return acc;
      }, {});

      return { error: errors, value: null };
    }

    return { error: null, value: result.value };
  }

  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Object to search
   * @param {String} path - Dot notation path (e.g., 'user.profile.name')
   * @returns {*} Value at path or undefined
   * 
   * @example
   * const data = { user: { profile: { name: 'John' } } };
   * Validator.getNestedValue(data, 'user.profile.name'); // 'John'
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Validate required fields in data object
   * @param {Object} data - Data object to validate
   * @param {Array<String>} fields - Required field names (supports dot notation)
   * @returns {Object} Object with errors (empty if valid)
   * 
   * @example
   * const errors = Validator.validateRequiredFields(data, ['name', 'user.email']);
   * if (Object.keys(errors).length > 0) {
   *   throw new ValidationError(errors);
   * }
   */
  static validateRequiredFields(data, fields) {
    const errors = {};
    for (const field of fields) {
      const value = this.getNestedValue(data, field);
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${field} is required`;
      }
    }
    return errors;
  }

  /**
   * Validate middleware
   */
  static middleware(schema) {
    return (req, res, next) => {
      const data = { ...req.body, ...req.query, ...req.params };
      const { error, value } = Validator.validate(data, schema);

      if (error) {
        return res.status(422).json({
          success: false,
          message: 'Validation Error',
          errors: error,
        });
      }

      req.body = value;
      next();
    };
  }

  /**
   * Create validation schema
   */
  static make(rules) {
    return Joi.object(rules);
  }

  /**
   * Common validation rules
   */
  static rules = {
    string: () => Joi.string(),
    number: () => Joi.number(),
    boolean: () => Joi.boolean(),
    email: () => Joi.string().email(),
    required: () => Joi.required(),
    optional: () => Joi.optional(),
    min: (limit) => Joi.string().min(limit),
    max: (limit) => Joi.string().max(limit),
    pattern: (regex) => Joi.string().pattern(regex),
    uuid: () => Joi.string().uuid(),
    date: () => Joi.date(),
    array: () => Joi.array(),
    object: (schema) => schema ? Joi.object(schema) : Joi.object(),
  };
}

export default Validator;
