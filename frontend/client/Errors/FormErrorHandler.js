/**
 * Form Error Handling Utilities
 * 
 * Framework-agnostic error handling utilities for forms
 * Handles backend validation errors and maps them to form fields
 * Similar to Laravel's error bag functionality
 */

/**
 * Handle API errors in forms with Formik
 * Automatically maps backend validation errors to form fields
 * Shows appropriate toast notifications
 * 
 * @param {Object} error - Error object from API call
 * @param {Function} setFieldError - Formik's setFieldError function
 * @param {Object} options - Configuration options
 * @param {string} options.fallbackMessage - Message to show if no specific error message
 * @param {Function} options.onValidationError - Callback for validation errors
 * @param {Function} options.onError - Callback for other errors
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {boolean} options.logError - Whether to log error to console (default: true)
 * 
 * @example
 * ```javascript
 * import { handleFormError } from '@neastore-js/web-utils';
 * 
 * const handleSubmit = async (values, { setFieldError }) => {
 *   try {
 *     await brandService.create(values);
 *     toast.success("Brand created successfully");
 *   } catch (error) {
 *     handleFormError(error, setFieldError, {
 *       fallbackMessage: "Failed to save brand"
 *     });
 *   }
 * };
 * ```
 */
export const handleFormError = (error, setFieldError, options = {}) => {
    const {
        fallbackMessage = 'An error occurred',
        onValidationError,
        onError,
        showToast = true,
        logError = true,
    } = options;

    // Log error for debugging
    if (logError) {
        console.error('Form error:', error);
    }

    // Handle validation errors (422) - attach to form fields
    if (error.isValidationError && error.errors && typeof error.errors === 'object') {
        // Set field-level errors from backend
        Object.keys(error.errors).forEach((field) => {
            if (setFieldError) {
                setFieldError(field, error.errors[field]);
            }
        });

        // Show error message
        if (showToast) {
            console.error(error.message || 'Please fix the validation errors');
        }

        // Call custom validation error handler if provided
        if (onValidationError) {
            onValidationError(error.errors, error.message);
        }

        return {
            type: 'validation',
            errors: error.errors,
            message: error.message,
        };
    }

    // Handle permission errors (403) - don't show field errors
    if (error.isPermissionError) {
        // Toast is already shown by api-client interceptor
        // Just call custom handler if provided
        if (onError) {
            onError(error);
        }

        return {
            type: 'permission',
            message: error.message,
        };
    }

    // Handle other errors - show error message
    // Backend MUST send error.message (standardized)
    const errorMessage = error.message || fallbackMessage;

    if (showToast) {
        console.error(errorMessage);
    }

    // Call custom error handler if provided
    if (onError) {
        onError(error);
    }

    return {
        type: 'error',
        message: errorMessage,
    };
};

/**
 * Handle API errors without Formik
 * For simple forms or non-Formik scenarios
 * 
 * @param {Object} error - Error object from API call
 * @param {Object} options - Configuration options
 * @param {string} options.fallbackMessage - Message to show if no specific error message
 * @param {Function} options.onError - Callback for errors
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {boolean} options.logError - Whether to log error to console (default: true)
 * 
 * @example
 * ```javascript
 * import { handleApiError } from '@neastore-js/web-utils';
 * 
 * try {
 *   await api.delete('/brands/123');
 *   toast.success("Brand deleted");
 * } catch (error) {
 *   handleApiError(error, { fallbackMessage: "Failed to delete brand" });
 * }
 * ```
 */
export const handleApiError = (error, options = {}) => {
    const {
        fallbackMessage = 'An error occurred',
        onError,
        showToast = true,
        logError = true,
    } = options;

    // Log error for debugging
    if (logError) {
        console.error('API error:', error);
    }

    // Get error message
    // Backend MUST send error.message (standardized)
    const errorMessage = error.message || fallbackMessage;

    // Show toast notification
    if (showToast && !error.isPermissionError) {
        // Don't show toast for permission errors as api-client already shows SweetAlert
        toast.error(errorMessage);
    }

    // Call custom error handler if provided
    if (onError) {
        onError(error);
    }

    return {
        type: error.isValidationError ? 'validation' : error.isPermissionError ? 'permission' : 'error',
        message: errorMessage,
        errors: error.errors || {},
    };
};

/**
 * Extract validation errors from backend response
 * Useful for custom error display logic
 * 
 * @param {Object} error - Error object from API call
 * @returns {Object} Validation errors object
 * 
 * @example
 * ```javascript
 * const errors = getValidationErrors(error);
 * // { name: "Brand name already exists", email: "Invalid email" }
 * ```
 */
export const getValidationErrors = (error) => {
    if (error.isValidationError && error.errors) {
        return error.errors;
    }
    return {};
};

/**
 * Check if error is a validation error
 * 
 * @param {Object} error - Error object from API call
 * @returns {boolean} True if validation error
 */
export const isValidationError = (error) => {
    return error?.isValidationError === true && typeof error.errors === 'object';
};

/**
 * Check if error is a permission error
 * 
 * @param {Object} error - Error object from API call
 * @returns {boolean} True if permission error
 */
export const isPermissionError = (error) => {
    return error?.isPermissionError === true;
};

/**
 * Get error message from error object
 * Backend MUST send error.message (standardized)
 * 
 * @param {Object} error - Error object
 * @param {string} fallback - Fallback message if no message found
 * @returns {string} Error message
 */
export const getErrorMessage = (error, fallback = 'An error occurred') => {
    return error?.message || fallback;
};
