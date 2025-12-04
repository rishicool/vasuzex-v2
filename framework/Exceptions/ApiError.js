/**
 * ApiError - Base API Error class
 * 
 * Provides a structured way to handle errors in API responses
 * with HTTP status codes, error messages, and additional context.
 */
export class ApiError extends Error {
  /**
   * Create an API Error
   * 
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {object|null} errors - Additional error details (e.g., validation errors)
   * @param {string|null} code - Error code for client handling
   * @param {boolean} isOperational - Whether error is operational (vs programming error)
   */
  constructor(
    message = 'An error occurred',
    statusCode = 500,
    errors = null,
    code = null,
    isOperational = true
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code || this.constructor.name;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    const response = {
      success: false,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp,
    };

    if (this.errors) {
      response.errors = this.errors;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      response.stack = this.stack;
    }

    return response;
  }

  /**
   * Get HTTP status code
   */
  getStatusCode() {
    return this.statusCode;
  }

  /**
   * Check if error is operational
   */
  isOperationalError() {
    return this.isOperational;
  }
}
