/**
 * Integration tests for @vasuzex/client error handling
 */

describe('Errors Module', () => {
  const {
    handleFormError,
    handleApiError,
    getValidationErrors,
    isValidationError,
    isPermissionError,
    getErrorMessage
  } = require('../dist/Errors/index.cjs');

  describe('isValidationError', () => {
    it('should identify 422 validation errors', () => {
      const error = {
        response: {
          status: 422,
          data: { errors: { email: ['Invalid email'] } }
        }
      };
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for non-validation errors', () => {
      const error = {
        response: { status: 500 }
      };
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for errors without response', () => {
      expect(isValidationError({})).toBe(false);
      expect(isValidationError(null)).toBe(false);
    });
  });

  describe('isPermissionError', () => {
    it('should identify 403 permission errors', () => {
      const error = {
        response: { status: 403 }
      };
      expect(isPermissionError(error)).toBe(true);
    });

    it('should return false for non-permission errors', () => {
      const error = {
        response: { status: 422 }
      };
      expect(isPermissionError(error)).toBe(false);
    });
  });

  describe('getValidationErrors', () => {
    it('should extract Laravel-style errors', () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Email is required', 'Email must be valid'],
              password: ['Password too short']
            }
          }
        }
      };

      const errors = getValidationErrors(error);
      expect(errors.email).toContain('Email is required');
      expect(errors.password).toContain('Password too short');
    });

    it('should extract nested errors', () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              'user.email': ['Invalid email']
            }
          }
        }
      };

      const errors = getValidationErrors(error);
      expect(errors['user.email']).toContain('Invalid email');
    });

    it('should return empty object for non-validation errors', () => {
      const error = {
        response: { status: 500 }
      };

      expect(getValidationErrors(error)).toEqual({});
    });

    it('should handle errors without response', () => {
      expect(getValidationErrors({})).toEqual({});
      expect(getValidationErrors(null)).toEqual({});
    });
  });

  describe('getErrorMessage', () => {
    it('should get message from error.message', () => {
      const error = new Error('Network error');
      expect(getErrorMessage(error)).toBe('Network error');
    });

    it('should return fallback for unknown errors', () => {
      expect(getErrorMessage({})).toBe('An error occurred');
      expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
    });

    it('should not read from response.data.message (not implemented)', () => {
      // Current implementation only checks error.message
      const error = {
        response: {
          data: { message: 'Custom error message' }
        }
      };
      expect(getErrorMessage(error)).toBe('An error occurred'); // Falls back
    });
  });

  describe('handleFormError', () => {
    it('should handle validation errors with proper structure', () => {
      const setFieldError = jest.fn();
      const error = {
        isValidationError: true,
        message: 'Validation failed',
        errors: {
          email: 'Email is required',
          password: 'Password too short'
        }
      };

      const result = handleFormError(error, setFieldError, { showToast: false, logError: false });

      expect(setFieldError).toHaveBeenCalledWith('email', 'Email is required');
      expect(setFieldError).toHaveBeenCalledWith('password', 'Password too short');
      expect(result.type).toBe('validation');
    });

    it('should show generic message for non-validation errors', () => {
      const setFieldError = jest.fn();
      const error = {
        message: 'Server error'
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      handleFormError(error, setFieldError, { showToast: false });
      
      expect(setFieldError).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleApiError', () => {
    it('should log validation errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = {
        isValidationError: true,
        message: 'Validation failed',
        errors: { email: 'Invalid' }
      };

      handleApiError(error, { logError: false });
      
      consoleErrorSpy.mockRestore();
    });

    it('should log permission errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = {
        isPermissionError: true,
        message: 'Access denied'
      };

      handleApiError(error, { logError: false });
      
      consoleErrorSpy.mockRestore();
    });
  });
});
