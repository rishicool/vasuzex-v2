/**
 * Vasuzex Database Module Exports
 * Users should import from 'vasuzex/Database' instead of 'guruorm' directly
 */

export { Model } from './Model.js';
export { QueryBuilder } from './QueryBuilder.js';
export { 
  parseDatabaseError, 
  isDatabaseError, 
  logDatabaseError, 
  enhanceDatabaseError 
} from './DatabaseErrorHandler.js';

// Re-export GuruORM utilities that users might need
// This allows users to use vasuzex as the single import source
export { Capsule, Schema } from 'guruorm';
