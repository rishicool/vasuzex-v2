/**
 * Utilities Module
 * 
 * Helper functions and utilities for Vasuzex React components.
 * 
 * @module utils
 */

// Accessibility utilities
export {
  generateId,
  announceToScreenReader,
  handleListNavigation,
  trapFocus,
  getFieldAriaProps,
  isVisibleToScreenReader,
} from './accessibility.js';

// Formatters (date, currency, phone, etc.)
export * from './formatters';
export { default as formatters } from './formatters';

// Storage utilities (localStorage helpers)
export * from './storage';
export { default as storage } from './storage';

// SweetAlert2 utilities (showSuccess, showError, showConfirm, etc.)
export * from './swal';
export { default as swal } from './swal';

// Validation utilities (validators, validationMessages, validate)
export * from './validation';
export { default as validation } from './validation';

// Logger utilities
export * from './logger';
export { default as logger } from './logger';

// HTTP Client (re-export from client package)
export { createApiClient, createApiHelpers } from '../../client/Http/index.js';

// Config Loader (re-export from client package)
export { loadAppConfig, clearConfigCache } from '../../client/Config/index.js';

// Error Handlers (re-export from client package)
export { handleFormError, getValidationErrors } from '../../client/Errors/index.js';
