/**
 * @vasuzex/client - Framework-agnostic utilities for Vasuzex v2
 * @module @vasuzex/client
 */

// HTTP utilities
export { createApiClient, createApiHelpers } from './Http/index.js';

// Config utilities
export { loadAppConfig, clearConfigCache } from './Config/index.js';

// Validation utilities
export { validators, validationMessages, validate, setupYupValidators } from './Validation/index.js';

// Formatters
export { 
  formatDate, 
  formatDateTime, 
  formatTime,
  formatCurrency,
  formatPhone,
  formatRelativeTime 
} from './Formatters/index.js';

// Storage utilities
export { storage } from './Storage/index.js';

// Alert utilities
export { showSuccess, showError, showInfo, showWarning, showConfirm } from './Alerts/index.js';

// Error handling
export { 
  handleFormError,
  handleApiError,
  getValidationErrors,
  isValidationError,
  isPermissionError,
  getErrorMessage
} from './Errors/index.js';
