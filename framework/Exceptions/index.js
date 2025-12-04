/**
 * Exceptions Module
 * 
 * Provides comprehensive error handling for the framework.
 */

export { ApiError } from './ApiError.js';
export {
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
} from './ErrorTypes.js';
export { ExceptionHandler, createExceptionHandler } from './Handler.js';
export { asyncHandler, asyncMiddleware, catchAsync } from './asyncHandler.js';
