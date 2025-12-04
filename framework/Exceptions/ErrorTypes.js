import { ApiError } from './ApiError.js';

/**
 * ValidationError - 422 Unprocessable Entity
 * 
 * Used when request validation fails.
 */
export class ValidationError extends ApiError {
  constructor(errors, message = 'Validation failed') {
    super(message, 422, errors, 'VALIDATION_ERROR', true);
  }
}

/**
 * BadRequestError - 400 Bad Request
 * 
 * Used when request is malformed or invalid.
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', errors = null) {
    super(message, 400, errors, 'BAD_REQUEST', true);
  }
}

/**
 * UnauthorizedError - 401 Unauthorized
 * 
 * Used when authentication is required but not provided or invalid.
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errors = null) {
    super(message, 401, errors, 'UNAUTHORIZED', true);
  }
}

/**
 * ForbiddenError - 403 Forbidden
 * 
 * Used when user is authenticated but lacks permissions.
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errors = null) {
    super(message, 403, errors, 'FORBIDDEN', true);
  }
}

/**
 * NotFoundError - 404 Not Found
 * 
 * Used when requested resource doesn't exist.
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errors = null) {
    super(message, 404, errors, 'NOT_FOUND', true);
  }
}

/**
 * ConflictError - 409 Conflict
 * 
 * Used when request conflicts with current state (e.g., duplicate resource).
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', errors = null) {
    super(message, 409, errors, 'CONFLICT', true);
  }
}

/**
 * TooManyRequestsError - 429 Too Many Requests
 * 
 * Used when rate limit is exceeded.
 */
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests', errors = null) {
    super(message, 429, errors, 'TOO_MANY_REQUESTS', true);
  }
}

/**
 * InternalServerError - 500 Internal Server Error
 * 
 * Used for unexpected server errors.
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', errors = null) {
    super(message, 500, errors, 'INTERNAL_SERVER_ERROR', true);
  }
}

/**
 * ServiceUnavailableError - 503 Service Unavailable
 * 
 * Used when service is temporarily unavailable.
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable', errors = null) {
    super(message, 503, errors, 'SERVICE_UNAVAILABLE', true);
  }
}

/**
 * DatabaseError - Database-related errors
 * 
 * Used for database connection or query errors.
 */
export class DatabaseError extends ApiError {
  constructor(message = 'Database error', errors = null) {
    super(message, 500, errors, 'DATABASE_ERROR', true);
  }
}

/**
 * AuthenticationError - Authentication-related errors
 * 
 * Used for token validation, password verification errors.
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', errors = null) {
    super(message, 401, errors, 'AUTHENTICATION_ERROR', true);
  }
}

/**
 * AuthorizationError - Authorization-related errors
 * 
 * Used for permission/role-based access errors.
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Authorization failed', errors = null) {
    super(message, 403, errors, 'AUTHORIZATION_ERROR', true);
  }
}
