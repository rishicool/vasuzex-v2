/**
 * Form Error Handling Utilities
 * 
 * Framework-agnostic error handling utilities for forms
 * Handles backend validation errors (Joi) and maps them to form fields
 * Compatible with both Yup (Formik) and Joi (backend) error formats
 * Similar to Laravel's error bag functionality
 */

/**
 * Handle API errors in forms with Formik
 * Automatically maps backend validation errors (Joi) to Formik field errors
 * Works seamlessly alongside Yup validation
 * Shows appropriate toast notifications
 * 
 * @param {Object} error - Error object from API call
 * @param {Function} setStatus - Formik's setStatus function to store backend errors separately
 * @param {Object} options - Configuration options
 * @param {string} options.fallbackMessage - Message to show if no specific error message
 * @param {Function} options.onValidationError - Callback for validation errors
 * @param {Function} options.onError - Callback for other errors
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {boolean} options.logError - Whether to log error to console (default: true)
 * @param {Object} options.toast - Toast library instance (react-toastify, sonner, etc.)
 * 
 * @example
 * ```javascript
 * import { handleFormError } from 'vasuzex/react';
 * import { toast } from 'react-toastify';
 * 
 * const handleSubmit = async (values, { setStatus }) => {
 *   try {
 *     await brandService.create(values);
 *     toast.success("Brand created successfully");
 *     setStatus({ backendErrors: null }); // Clear backend errors on success
 *   } catch (error) {
 *     handleFormError(error, setStatus, {
 *       fallbackMessage: "Failed to save brand",
 *       toast
 *     });
 *   }
 * };
 * ```
 * 
 * @example With nested fields (Joi backend validation)
 * ```javascript
 * // Backend returns:
 * {
 *   "success": false,
 *   "message": "Validation failed",
 *   "errors": {
 *     "phone": "Phone must be exactly 10 digits",
 *     "bankdetails.ifscCode": "Invalid IFSC code format",
 *     "owner.email": "Owner email must be a valid email address"
 *   }
 * }
 * 
 * // Stored in Formik status (doesn't conflict with Yup validation):
 * // setStatus({
 * //   backendErrors: {
 * //     'phone': 'Phone must be exactly 10 digits',
 * //     'bankdetails': { 'ifscCode': 'Invalid IFSC code format' },
 * //     'owner': { 'email': 'Owner email must be a valid email address' }
 * //   }
 * // })
 * ```
 */
export const handleFormError = (error, setStatus, options = {}) => {
    const {
        fallbackMessage = 'An error occurred',
        onValidationError,
        onError,
        showToast = true,
        logError = true,
        toast: toastLib,
    } = options;

    // Log error for debugging
    if (logError) {
        console.error('Form error:', error);
        console.log('[handleFormError] error.isValidationError:', error.isValidationError);
        console.log('[handleFormError] error.errors:', error.errors);
        console.log('[handleFormError] typeof error.errors:', typeof error.errors);
    }

    // Handle validation errors (422) - attach to form fields
    // Works with both Joi (backend) and Yup (frontend) error formats
    if (error.isValidationError && error.errors && typeof error.errors === 'object') {
        console.log('[handleFormError] Processing validation errors...');
        
        // Convert flat dot-notation errors to nested structure
        // Backend: { "bankdetails.ifscCode": "error" }
        // Formik needs: { bankdetails: { ifscCode: "error" } }
        const formikErrors = {};
        
        Object.keys(error.errors).forEach((field) => {
            console.log(`[handleFormError] Processing field "${field}":`, error.errors[field]);
            
            if (field.includes('.')) {
                // Nested field: convert "bankdetails.ifscCode" to { bankdetails: { ifscCode: "error" } }
                const parts = field.split('.');
                let current = formikErrors;
                
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!current[parts[i]]) {
                        current[parts[i]] = {};
                    }
                    current = current[parts[i]];
                }
                
                current[parts[parts.length - 1]] = error.errors[field];
            } else {
                // Top-level field
                formikErrors[field] = error.errors[field];
            }
        });
        
        console.log('[handleFormError] Storing backend errors in status:', formikErrors);
        
        // Store backend validation errors in Formik status
        // This prevents conflict with Yup validation
        // Components should check status.backendErrors first, then fall back to Formik errors
        if (setStatus) {
            setStatus({ backendErrors: formikErrors });
        }

        // Show error toast with validation message
        if (showToast && toastLib) {
            toastLib.error(error.message || 'Please fix the validation errors');
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

    if (showToast && toastLib) {
        toastLib.error(errorMessage);
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
 * Returns errors object for manual handling
 * 
 * @param {Object} error - Error object from API call
 * @param {Object} options - Configuration options
 * @param {string} options.fallbackMessage - Message to show if no specific error message
 * @param {Function} options.onError - Callback for errors
 * @param {boolean} options.showToast - Whether to show toast notification (default: true)
 * @param {boolean} options.logError - Whether to log error to console (default: true)
 * @param {Object} options.toast - Toast library instance (react-toastify, sonner, etc.)
 * 
 * @example
 * ```javascript
 * import { handleApiError } from 'vasuzex/react';
 * import { toast } from 'react-toastify';
 * 
 * try {
 *   await api.delete('/brands/123');
 *   toast.success("Brand deleted");
 * } catch (error) {
 *   const result = handleApiError(error, { 
 *     fallbackMessage: "Failed to delete brand",
 *     toast 
 *   });
 *   
 *   // Access validation errors if needed
 *   if (result.type === 'validation') {
 *     console.log(result.errors); // { field: "error message" }
 *   }
 * }
 * ```
 */
export const handleApiError = (error, options = {}) => {
    const {
        fallbackMessage = 'An error occurred',
        onError,
        showToast = true,
        logError = true,
        toast: toastLib,
    } = options;

    // Log error for debugging
    if (logError) {
        console.error('API error:', error);
    }

    // Get error message
    // Backend MUST send error.message (standardized)
    const errorMessage = error.message || fallbackMessage;

    // Show toast notification
    if (showToast && toastLib && !error.isPermissionError) {
        // Don't show toast for permission errors as api-client already shows SweetAlert
        toastLib.error(errorMessage);
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
