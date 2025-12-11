/**
 * useValidationErrors Hook
 * 
 * React hook for managing form validation errors.
 * 
 * @module hooks/useValidationErrors
 */

import { useState, useCallback } from 'react';
import { handleFormError, getValidationErrors } from '../utils/index.js';

/**
 * Hook for managing validation errors
 * 
 * @returns {{errors: Object, setErrors: Function, clearErrors: Function, getError: Function, hasError: Function, handleError: Function}}
 * 
 * @example
 * function MyForm() {
 *   const { errors, setErrors, getError, handleError, clearErrors } = useValidationErrors();
 *   
 *   const onSubmit = async (data) => {
 *     try {
 *       await apiClient.post('/api/users', data);
 *       clearErrors();
 *     } catch (error) {
 *       handleError(error);
 *     }
 *   };
 *   
 *   return (
 *     <form>
 *       <input name="email" />
 *       {getError('email') && <span>{getError('email')}</span>}
 *     </form>
 *   );
 * }
 */
export function useValidationErrors() {
  const [errors, setErrors] = useState({});
  
  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  /**
   * Clear error for a specific field
   * 
   * @param {string} field - Field name
   */
  const clearError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  /**
   * Get error message for a field
   * 
   * @param {string} field - Field name
   * @returns {string|null} Error message
   */
  const getError = useCallback((field) => {
    return errors[field] || null;
  }, [errors]);
  
  /**
   * Check if field has error
   * 
   * @param {string} field - Field name
   * @returns {boolean}
   */
  const hasError = useCallback((field) => {
    return !!errors[field];
  }, [errors]);
  
  /**
   * Check if there are any errors
   * 
   * @returns {boolean}
   */
  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);
  
  /**
   * Set error for a specific field
   * 
   * @param {string} field - Field name
   * @param {string} message - Error message
   */
  const setError = useCallback((field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);
  
  /**
   * Handle error from API response
   * 
   * @param {Error} error - Error object
   */
  const handleError = useCallback((error) => {
    const extractedErrors = getValidationErrors(error);
    setErrors(extractedErrors);
  }, []);
  
  /**
   * Set errors manually
   * 
   * @param {Object} newErrors - Errors object
   */
  const setErrorsManually = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);
  
  return {
    errors,
    setErrors: setErrorsManually,
    setError,
    clearErrors,
    clearError,
    getError,
    hasError,
    hasErrors,
    handleError,
  };
}
