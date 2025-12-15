/**
 * Database Error Handler
 * Automatically handles and logs database errors with detailed information
 * Integrates with vasuzex logging system based on LOG_LEVEL configuration
 */

/**
 * Parse and format database errors
 * @param {Error} error - The database error
 * @returns {Object} - Parsed error information
 */
export function parseDatabaseError(error) {
  const errorInfo = {
    message: error.message || 'Database error occurred',
    type: 'DatabaseError',
    details: null,
    sqlState: null,
    constraint: null,
    table: null,
    column: null,
    originalError: error,
  };

  // Check for PostgreSQL errors (pg driver errors have code, detail, etc.)
  if (error.code) {
    errorInfo.sqlState = error.code;
    
    switch (error.code) {
      // Unique constraint violation
      case '23505':
        errorInfo.type = 'UniqueConstraintViolation';
        errorInfo.message = 'A record with this value already exists';
        errorInfo.constraint = error.constraint;
        
        // Extract field name from constraint name or detail
        if (error.detail) {
          const match = error.detail.match(/Key \(([^)]+)\)/);
          if (match) {
            errorInfo.column = match[1];
            errorInfo.message = `A record with this ${match[1]} already exists`;
          }
        }
        break;
        
      // Foreign key constraint violation
      case '23503':
        errorInfo.type = 'ForeignKeyViolation';
        errorInfo.message = 'Referenced record does not exist or cannot be deleted due to existing references';
        errorInfo.constraint = error.constraint;
        
        if (error.detail) {
          errorInfo.details = error.detail;
        }
        break;
        
      // Not null constraint violation
      case '23502':
        errorInfo.type = 'NotNullViolation';
        errorInfo.column = error.column;
        errorInfo.message = `Field '${error.column}' is required`;
        break;
        
      // Check constraint violation
      case '23514':
        errorInfo.type = 'CheckConstraintViolation';
        errorInfo.message = 'Data validation failed';
        errorInfo.constraint = error.constraint;
        break;
        
      // Undefined table
      case '42P01':
        errorInfo.type = 'UndefinedTable';
        errorInfo.message = 'Database table does not exist';
        errorInfo.table = error.table;
        break;
        
      // Undefined column
      case '42703':
        errorInfo.type = 'UndefinedColumn';
        errorInfo.message = 'Database column does not exist';
        errorInfo.column = error.column;
        break;
        
      // Syntax error
      case '42601':
        errorInfo.type = 'SyntaxError';
        errorInfo.message = 'Invalid SQL syntax';
        break;
        
      default:
        errorInfo.message = error.message || `Database error (code: ${error.code})`;
    }
  }
  
  // Check for connection errors
  if (error.message && error.message.includes('connect')) {
    errorInfo.type = 'ConnectionError';
    errorInfo.message = 'Unable to connect to database';
  }
  
  // Check for timeout errors
  if (error.message && error.message.includes('timeout')) {
    errorInfo.type = 'TimeoutError';
    errorInfo.message = 'Database operation timed out';
  }
  
  // Check for GuruORM/Model specific errors
  if (error.message && error.message.includes('Cannot read properties of undefined')) {
    errorInfo.type = 'ModelError';
    errorInfo.message = 'Database model is not properly initialized';
    errorInfo.details = error.message;
  }

  // Check for query errors
  if (error.message && (error.message.includes('query') || error.message.includes('Query'))) {
    errorInfo.type = 'QueryError';
  }

  return errorInfo;
}

/**
 * Check if an error is a database error
 * @param {Error} error - The error to check
 * @returns {boolean}
 */
export function isDatabaseError(error) {
  return !!(
    error.code ||  // PostgreSQL/MySQL error codes
    (error.message && (
      error.message.includes('database') ||
      error.message.includes('query') ||
      error.message.includes('Query') ||
      error.message.includes('SQL') ||
      error.message.includes('relation') ||
      error.message.includes('constraint') ||
      error.message.includes('Cannot read properties of undefined') // GuruORM model error
    ))
  );
}

/**
 * Log database error with appropriate level based on configuration
 * Automatically called by Model and QueryBuilder when errors occur
 * @param {Error} error - The error to log
 * @param {Object} logger - The Log facade instance
 */
export function logDatabaseError(error, logger) {
  if (!isDatabaseError(error)) {
    return;
  }

  const parsedError = parseDatabaseError(error);

  // Build context for logging
  const context = {
    type: parsedError.type,
    sqlState: parsedError.sqlState,
    constraint: parsedError.constraint,
    table: parsedError.table,
    column: parsedError.column,
    details: parsedError.details,
    originalMessage: error.message,
  };

  // Add stack trace (will be filtered by LogManager based on debug mode)
  if (error.stack) {
    context.stack = error.stack;
  }

  // Log based on error type
  switch (parsedError.type) {
    case 'ConnectionError':
    case 'UndefinedTable':
    case 'ModelError':
      // Critical errors - system configuration issues
      logger.critical(parsedError.message, context);
      break;

    case 'UniqueConstraintViolation':
    case 'ForeignKeyViolation':
    case 'NotNullViolation':
    case 'CheckConstraintViolation':
      // Warning level - validation/constraint errors (expected in normal flow)
      logger.warning(parsedError.message, context);
      break;

    case 'TimeoutError':
    case 'SyntaxError':
    case 'UndefinedColumn':
      // Error level - unexpected runtime errors
      logger.error(parsedError.message, context);
      break;

    default:
      // Generic database errors
      logger.error(parsedError.message, context);
  }
}

/**
 * Enhance error with database-specific information
 * This creates a user-friendly error that can be thrown/returned
 * @param {Error} error - The original error
 * @returns {Error} - Enhanced error with better message
 */
export function enhanceDatabaseError(error) {
  if (!isDatabaseError(error)) {
    return error;
  }

  const parsedError = parseDatabaseError(error);

  // Create enhanced error
  const enhancedError = new Error(parsedError.message);
  enhancedError.type = parsedError.type;
  enhancedError.code = parsedError.sqlState;
  enhancedError.constraint = parsedError.constraint;
  enhancedError.table = parsedError.table;
  enhancedError.column = parsedError.column;
  enhancedError.details = parsedError.details;
  enhancedError.originalError = error;
  enhancedError.stack = error.stack;

  // Determine HTTP status code
  switch (parsedError.type) {
    case 'UniqueConstraintViolation':
      enhancedError.statusCode = 409; // Conflict
      break;
    case 'ForeignKeyViolation':
    case 'NotNullViolation':
    case 'CheckConstraintViolation':
      enhancedError.statusCode = 400; // Bad Request
      break;
    case 'UndefinedTable':
    case 'UndefinedColumn':
    case 'ConnectionError':
    case 'ModelError':
      enhancedError.statusCode = 500; // Internal Server Error
      break;
    case 'TimeoutError':
      enhancedError.statusCode = 504; // Gateway Timeout
      break;
    default:
      enhancedError.statusCode = 500;
  }

  return enhancedError;
}
