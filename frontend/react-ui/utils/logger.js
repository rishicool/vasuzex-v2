/**
 * Logger Utility
 * Simple console logging with context support for browser apps
 * 
 * Development: All logs enabled
 * Production: Only errors logged
 * 
 * @module @vasuzex/react/utils/logger
 */

const isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Logger object with standardized logging methods
 */
export const logger = {
  /**
   * Info logging - development only
   * @param {string} message - Log message
   * @param {any} [context] - Additional context
   */
  info: (message, context) => {
    if (isDevelopment) {
      console.log(`[App] ${message}`, context || '');
    }
  },

  /**
   * Warning logging
   * @param {string} message - Warning message
   * @param {any} [context] - Additional context
   */
  warning: (message, context) => {
    if (isDevelopment) {
      console.warn(`[App] ${message}`, context || '');
    }
  },

  /**
   * Error logging - always logged
   * @param {string} message - Error message
   * @param {Error|any} [error] - Error object or context
   */
  error: (message, error) => {
    console.error(`[App] ${message}`, error || '');
  },

  /**
   * Debug logging - development only
   * @param {string} message - Debug message
   * @param {any} [data] - Debug data
   */
  debug: (message, data) => {
    if (isDevelopment) {
      console.debug(`[App] ${message}`, data || '');
    }
  },
};

export default logger;
