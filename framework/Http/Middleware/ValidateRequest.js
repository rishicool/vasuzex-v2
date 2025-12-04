import Joi from 'joi';
import { ValidationError, BadRequestError } from '../../Exceptions/index.js';

/**
 * ValidateRequest Middleware
 * 
 * Validates request data against Joi schema.
 * Laravel-inspired request validation.
 */
export class ValidateRequest {
  /**
   * Create validate request middleware
   * 
   * @param {object} schema - Joi schema object
   * @param {object} options - Validation options
   */
  constructor(schema, options = {}) {
    this.schema = schema;
    this.options = {
      abortEarly: false,
      stripUnknown: true,
      ...options,
    };
  }

  /**
   * Handle the request
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   * @param {function} next - Next middleware
   */
  async handle(req, res, next) {
    try {
      // Determine what to validate
      const source = this.options.source || 'body';
      let data;

      if (source === 'all') {
        data = {
          body: req.body,
          query: req.query,
          params: req.params,
        };
      } else {
        data = req[source];
      }

      // Validate against schema
      const { error, value } = this.schema.validate(data, this.options);

      if (error) {
        const errors = this.formatJoiErrors(error.details);
        throw new ValidationError(errors, this.options.message || 'Validation failed');
      }

      // Replace request data with validated/sanitized data
      if (source === 'all') {
        req.body = value.body || req.body;
        req.query = value.query || req.query;
        req.params = value.params || req.params;
      } else {
        req[source] = value;
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Format Joi validation errors
   * 
   * @param {array} details - Joi error details
   * @returns {object} Formatted errors
   */
  formatJoiErrors(details) {
    const errors = {};
    
    details.forEach((error) => {
      const field = error.path.join('.');
      errors[field] = error.message;
    });

    return errors;
  }

  /**
   * Create middleware function
   * 
   * @returns {function} Express middleware
   */
  middleware() {
    return (req, res, next) => this.handle(req, res, next);
  }
}

/**
 * Create validate request middleware factory
 * 
 * @param {object} schema - Joi schema
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 * 
 * @example
 * const schema = Joi.object({
 *   email: Joi.string().email().required(),
 *   password: Joi.string().min(8).required()
 * });
 * 
 * router.post('/register', validateRequest(schema), (req, res) => {
 *   // req.body is validated and sanitized
 * });
 */
export function validateRequest(schema, options = {}) {
  const middleware = new ValidateRequest(schema, options);
  return middleware.middleware();
}

/**
 * Validate request body
 * 
 * @param {object} schema - Joi schema
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
export function validateBody(schema, options = {}) {
  return validateRequest(schema, { ...options, source: 'body' });
}

/**
 * Validate query parameters
 * 
 * @param {object} schema - Joi schema
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
export function validateQuery(schema, options = {}) {
  return validateRequest(schema, { ...options, source: 'query' });
}

/**
 * Validate route parameters
 * 
 * @param {object} schema - Joi schema
 * @param {object} options - Validation options
 * @returns {function} Express middleware
 */
export function validateParams(schema, options = {}) {
  return validateRequest(schema, { ...options, source: 'params' });
}

/**
 * Common validation schemas
 */
export const CommonValidators = {
  /**
   * Validate ID parameter (UUID or MongoDB ObjectId)
   */
  id: (field = 'id') => {
    return validateParams(
      Joi.object({
        [field]: Joi.alternatives()
          .try(
            Joi.string().uuid(),
            Joi.string().regex(/^[0-9a-fA-F]{24}$/)
          )
          .required()
          .messages({
            'alternatives.match': `${field} must be a valid UUID or ObjectId`,
          }),
      })
    );
  },

  /**
   * Validate pagination parameters
   */
  pagination: () => {
    return validateQuery(
      Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(15),
        sort: Joi.string().default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc'),
      })
    );
  },

  /**
   * Validate email
   */
  email: () => {
    return validateBody(
      Joi.object({
        email: Joi.string().email().required(),
      })
    );
  },

  /**
   * Validate search query
   */
  search: () => {
    return validateQuery(
      Joi.object({
        q: Joi.string().min(1).max(255).required(),
        fields: Joi.alternatives()
          .try(
            Joi.string(),
            Joi.array().items(Joi.string())
          )
          .optional(),
      })
    );
  },
};
