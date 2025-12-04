import Joi from 'joi';

/**
 * FormRequest - Base class for validation (Laravel pattern)
 * 
 * @example
 * class CreatePostRequest extends FormRequest {
 *   rules() {
 *     return {
 *       title: Joi.string().required(),
 *       content: Joi.string().required(),
 *     };
 *   }
 * }
 */
export class FormRequest {
  constructor(data) {
    this.data = data;
    this.validated = null;
    this.errors = null;
  }

  /**
   * Define validation rules (override in child class)
   * @returns {Object} Joi schema object
   */
  rules() {
    return {};
  }

  /**
   * Custom error messages (optional)
   */
  messages() {
    return {};
  }

  /**
   * Validate the request data
   */
  validate() {
    const schema = Joi.object(this.rules());
    const { error, value } = schema.validate(this.data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      this.errors = this._formatErrors(error);
      return false;
    }

    this.validated = value;
    return true;
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
   * Format validation errors
   * @private
   */
  _formatErrors(error) {
    const formatted = {};
    error.details.forEach(detail => {
      const field = detail.path.join('.');
      if (!formatted[field]) {
        formatted[field] = [];
      }
      formatted[field].push(detail.message);
    });
    return formatted;
  }

  /**
   * Static method to validate and return middleware
   */
  static middleware(RequestClass) {
    return (req, res, next) => {
      const request = new RequestClass(req.body);
      
      if (!request.validate()) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: request.errors,
        });
      }

      // Attach validated data to request
      req.validated = request.validated;
      next();
    };
  }
}

export default FormRequest;
