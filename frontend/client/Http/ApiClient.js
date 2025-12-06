/**
 * API Client Factory
 *
 * Creates axios instances with authentication interceptors and error handling.
 * Simple and flexible - apps provide their own configuration.
 */

import axios from 'axios';
import { getStorageItem, removeStorageItem } from '../Storage/LocalStorage.js';

/**
 * Show session expired alert using SweetAlert2
 * Dynamic import to avoid bundling if not needed
 */
const showSessionExpiredAlert = async (onConfirm) => {
  try {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      title: 'Session Expired',
      text: 'Your session has expired. Please login again to continue.',
      icon: 'warning',
      confirmButtonText: 'Login Now',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
    if (onConfirm) {
      onConfirm();
    }
  } catch (error) {
    // Fallback if SweetAlert2 is not available
    console.warn('SweetAlert2 not available, using alert');
    alert('Your session has expired. Please login again to continue.');
    if (onConfirm) {
      onConfirm();
    }
  }
};

/**
 * Show permission denied alert using SweetAlert2
 */
const showPermissionDeniedAlert = async (message) => {
  try {
    const Swal = (await import('sweetalert2')).default;
    await Swal.fire({
      title: 'Access Restricted',
      text: message || "You don't have permission to perform this action.",
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
    });
  } catch (error) {
    // Fallback if SweetAlert2 is not available
    console.warn('SweetAlert2 not available, using alert');
    alert(message || "You don't have permission to perform this action.");
  }
};

/**
 * Create an axios instance with auth interceptors
 *
 * @param {Object} config - Configuration options
 * @param {string} config.baseURL - Base URL for API
 * @param {number} [config.timeout=30000] - Request timeout
 * @param {string} config.tokenKey - Storage key for auth token
 * @param {string} [config.userKey] - Storage key for user data
 * @param {boolean} [config.enableLogging=false] - Enable request logging
 * @param {Function} [config.onUnauthorized] - Callback for 401 errors
 * @param {Function} [config.customResponseInterceptor] - Additional response interceptor
 * @returns {import('axios').AxiosInstance} Configured axios instance
 */
export function createApiClient(config) {
  const {
    baseURL,
    timeout = 30000,
    tokenKey,
    userKey,
    enableLogging = false,
    onUnauthorized,
    customResponseInterceptor,
  } = config;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add auth token
  client.interceptors.request.use(
    (requestConfig) => {
      const token = getStorageItem(tokenKey);
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        if (enableLogging) {
          console.log('🔑 API Request with token:', token.substring(0, 20) + '...');
        }
      } else if (enableLogging) {
        console.warn('⚠️ No token found in storage');
      }

      // Remove Content-Type header if data is FormData (browser will set it with boundary)
      if (requestConfig.data instanceof FormData) {
        delete requestConfig.headers['Content-Type'];
      }

      return requestConfig;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor - Handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const errorData = error.response?.data;

      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        // Check if it's a token error (clear auth and redirect)
        const isTokenError =
          errorData?.error?.includes('token') ||
          errorData?.error?.includes('Token expired') ||
          errorData?.error?.includes('Invalid token') ||
          errorData?.message?.includes('token') ||
          errorData?.message?.includes('Token expired') ||
          errorData?.message?.includes('Invalid token') ||
          errorData?.message?.includes('Authentication required') ||
          errorData?.message?.includes('Unauthorized');

        if (isTokenError) {
          // Clear tokens
          removeStorageItem(tokenKey);
          if (userKey) {
            removeStorageItem(userKey);
          }

          // Show session expired alert, then redirect
          await showSessionExpiredAlert(() => {
            if (onUnauthorized) {
              onUnauthorized();
            }
          });
        }
      }

      // Handle 403 Forbidden (Permission denied)
      if (error.response?.status === 403) {
        const errorMessage = errorData?.message || errorData?.error || "You don't have permission to perform this action";

        // Show permission denied alert without redirecting to login
        await showPermissionDeniedAlert(errorMessage);

        return Promise.reject({
          message: errorMessage,
          status: error.response?.status,
          data: error.response?.data,
          errors: errorData?.errors || {},
          isPermissionError: true,
        });
      }

      // Handle 422 Validation Errors (standardized format)
      if (error.response?.status === 422) {
        return Promise.reject({
          message: errorData?.message || 'Validation failed',
          status: error.response?.status,
          data: error.response?.data,
          errors: errorData?.errors || {},
          isValidationError: true,
        });
      }

      // Return standardized error
      const errorMessage = errorData?.message || errorData?.error || error.message || 'An error occurred';
      return Promise.reject({
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        errors: errorData?.errors || {},
      });
    },
  );

  // Add custom response interceptor if provided (for app-specific logic)
  if (customResponseInterceptor) {
    client.interceptors.response.use(
      (response) => response,
      customResponseInterceptor
    );
  }

  return client;
}

/**
 * Create API helper methods for a client
 * These wrap axios methods to return data directly
 * Automatically unwraps standardized response format
 *
 * @param {import('axios').AxiosInstance} client - Axios instance
 * @returns {Object} Object with helper methods
 */
export function createApiHelpers(client) {
  /**
   * Unwrap standardized response format
   * Handles both proper format and legacy pagination pattern
   * 
   * Standard format: {success, message, data}
   * Legacy format: {success, data, pagination} <- Will be fixed in Phase 3
   * 
   * Returns: { data, success, message, pagination? }
   * Access: response.data (actual data), response.success, response.message
   */
  const unwrapResponse = (res) => {
    // Check if response has standardized format {success, message, data}
    if (res.data && typeof res.data === 'object' && 'success' in res.data) {
      const { success, message, data, pagination } = res.data;

      // Build clean response
      const unwrapped = {
        data,
        success,
        message,
      };

      // Handle legacy pagination pattern (Phase 3 will fix backend)
      // Some controllers return: {success, data: items, pagination: {...}}
      // This should be: {success, data: {items, pagination}}
      if (pagination) {
        unwrapped.pagination = pagination;
      }

      return unwrapped;
    }

    // For non-standardized responses, return as-is
    return res.data;
  };

  return {
    get: (url, config) => client.get(url, config).then(unwrapResponse),

    post: (url, data, config) => client.post(url, data, config).then(unwrapResponse),

    put: (url, data, config) => client.put(url, data, config).then(unwrapResponse),

    delete: (url, config) => client.delete(url, config).then(unwrapResponse),

    patch: (url, data, config) => client.patch(url, data, config).then(unwrapResponse),
  };
}

