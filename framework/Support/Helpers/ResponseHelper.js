/**
 * ResponseHelper - Standardized JSON response formatting
 * 
 * Provides consistent API response structure across the application.
 */

/**
 * Success response
 * 
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {object} Express response
 */
export function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Error response
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {object} error - Error details
 * @returns {object} Express response
 */
export function error(res, message = 'Error occurred', statusCode = 500, error = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = error;
  }

  return res.status(statusCode).json(response);
}

/**
 * Created response (201)
 * 
 * @param {object} res - Express response object
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {object} Express response
 */
export function created(res, data = null, message = 'Resource created successfully') {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * No content response (204)
 * 
 * @param {object} res - Express response object
 * @returns {object} Express response
 */
export function noContent(res) {
  return res.status(204).send();
}

/**
 * Bad request response (400)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {object} error - Error details
 * @returns {object} Express response
 */
export function badRequest(res, message = 'Bad request', error = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = error;
  }

  return res.status(400).json(response);
}

/**
 * Unauthorized response (401)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} Express response
 */
export function unauthorized(res, message = 'Unauthorized') {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Forbidden response (403)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} Express response
 */
export function forbidden(res, message = 'Forbidden') {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Not found response (404)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @returns {object} Express response
 */
export function notFound(res, message = 'Resource not found') {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Conflict response (409)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {object} error - Error details
 * @returns {object} Express response
 */
export function conflict(res, message = 'Resource conflict', error = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = error;
  }

  return res.status(409).json(response);
}

/**
 * Validation error response (422)
 * 
 * @param {object} res - Express response object
 * @param {object} errors - Validation errors
 * @param {string} message - Error message
 * @returns {object} Express response
 */
export function validationError(res, errors = {}, message = 'Validation failed') {
  return res.status(422).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Server error response (500)
 * 
 * @param {object} res - Express response object
 * @param {string} message - Error message
 * @param {object} error - Error details
 * @returns {object} Express response
 */
export function serverError(res, message = 'Internal server error', error = null) {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    response.error = error;
  }

  return res.status(500).json(response);
}

/**
 * Paginated response
 * 
 * @param {object} res - Express response object
 * @param {Array} data - Response data
 * @param {object} pagination - Pagination metadata
 * @param {string} message - Success message
 * @returns {object} Express response
 */
export function paginated(res, data = [], pagination = {}, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Custom response
 * 
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response data
 * @returns {object} Express response
 */
export function custom(res, statusCode, data) {
  return res.status(statusCode).json(data);
}

/**
 * ResponseHelper class for OOP approach
 */
export class ResponseHelper {
  static success = success;
  static error = error;
  static created = created;
  static noContent = noContent;
  static badRequest = badRequest;
  static unauthorized = unauthorized;
  static forbidden = forbidden;
  static notFound = notFound;
  static conflict = conflict;
  static validationError = validationError;
  static serverError = serverError;
  static paginated = paginated;
  static custom = custom;
}

export default ResponseHelper;
