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
