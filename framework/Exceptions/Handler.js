import { ApiError } from './ApiError.js';
import {
  InternalServerError,
  ValidationError,
  AuthenticationError,
} from './ErrorTypes.js';

/**
 * ExceptionHandler - Global exception handler
 * 
 * Handles all errors in the application and formats them
 * for consistent API responses. Inspired by Laravel's exception handler.
 */
export class ExceptionHandler {
  constructor(options = {}) {
    this.debug = options.debug ?? (process.env.NODE_ENV === 'development');
    this.logger = options.logger ?? console;
    this.reportableErrors = options.reportableErrors ?? [];
    this.dontReport = options.dontReport ?? [];
  }

  /**
   * Handle an exception and send response
   * 
   * @param {Error} error - The error to handle
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next function
   */
  handle(error, req, res, next) {
    // Report the error (logging, monitoring, etc.)
    this.report(error, req);

    // Render the error response
    return this.render(error, req, res);
  }

  /**
   * Report the error (logging, monitoring)
   * 
   * @param {Error} error - The error to report
   * @param {object} req - Express request object
   */
  report(error, req) {
    // Skip reporting for certain error types
    if (this.shouldntReport(error)) {
      return;
    }

    // Log error details
    this.logger.error('Error occurred:', {
      message: error.message,
      statusCode: error.statusCode || 500,
      code: error.code,
      stack: error.stack,
      url: req?.url,
      method: req?.method,
      ip: req?.ip,
      user: req?.user?.id,
    });

    // Custom reporting (e.g., Sentry, LogRocket)
    if (this.shouldReport(error)) {
      this.reportToExternalService(error, req);
    }
  }

  /**
   * Render error response
   * 
   * @param {Error} error - The error to render
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  render(error, req, res) {
    // Convert to ApiError if not already
    const apiError = this.convertToApiError(error);

    // Get response format
    const response = this.formatErrorResponse(apiError, req);

    // Send response
    return res.status(apiError.getStatusCode()).json(response);
  }

  /**
   * Convert any error to ApiError
   * 
   * @param {Error} error - The error to convert
   * @returns {ApiError}
   */
  convertToApiError(error) {
    if (error instanceof ApiError) {
      return error;
    }

    // Handle specific error types
    if (error.name === 'ValidationError' && error.details) {
      // Joi validation error
      return new ValidationError(
        this.formatJoiErrors(error.details),
        error.message
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return new AuthenticationError('Invalid token');
    }

    if (error.name === 'TokenExpiredError') {
      return new AuthenticationError('Token expired');
    }

    // Default to internal server error
    return new InternalServerError(
      this.debug ? error.message : 'Internal server error',
      this.debug ? { originalError: error.message } : null
    );
  }

  /**
   * Format error response
   * 
   * @param {ApiError} error - The API error
   * @param {object} req - Express request object
   * @returns {object}
   */
  formatErrorResponse(error, req) {
    const response = {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      timestamp: error.timestamp || new Date().toISOString(),
    };

    // Add validation errors
    if (error.errors) {
      response.errors = error.errors;
    }

    // Add stack trace in debug mode
    if (this.debug && error.stack) {
      response.stack = error.stack;
      response.path = req?.url;
      response.method = req?.method;
    }

    return response;
  }

  /**
   * Format Joi validation errors
   * 
   * @param {array} details - Joi error details
   * @returns {object}
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
   * Check if error should be reported
   * 
   * @param {Error} error - The error to check
   * @returns {boolean}
   */
  shouldReport(error) {
    // Check if error type is in reportable list
    return this.reportableErrors.some(
      (ErrorClass) => error instanceof ErrorClass
    );
  }

  /**
   * Check if error should NOT be reported
   * 
   * @param {Error} error - The error to check
   * @returns {boolean}
   */
  shouldntReport(error) {
    // Don't report certain error types (404, validation, etc.)
    return this.dontReport.some(
      (ErrorClass) => error instanceof ErrorClass
    );
  }

  /**
   * Report to external monitoring service
   * 
   * @param {Error} error - The error to report
   * @param {object} req - Express request object
   */
  reportToExternalService(error, req) {
    // Implement external error reporting (Sentry, LogRocket, etc.)
    // Override this method in your app's exception handler
  }

  /**
   * Create Express error handling middleware
   * 
   * @returns {function}
   */
  middleware() {
    return (error, req, res, next) => {
      return this.handle(error, req, res, next);
    };
  }
}

/**
 * Create a new exception handler instance
 * 
 * @param {object} options - Handler options
 * @returns {ExceptionHandler}
 */
export function createExceptionHandler(options = {}) {
  return new ExceptionHandler(options);
}
