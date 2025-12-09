/**
 * API Helper Methods
 * 
 * Creates convenience methods that wrap axios and automatically unwrap
 * standardized response formats.
 * 
 * @module Http/ApiHelpers
 */

/**
 * Create API helper methods for a client
 * These wrap axios methods to return data directly
 * Automatically unwraps standardized response format
 *
 * @param {import('axios').AxiosInstance} client - Axios instance
 * @returns {Object} Object with helper methods (get, post, put, patch, delete)
 */
export function createApiHelpers(client) {
  /**
   * Unwrap standardized response format
   * Handles both proper format and legacy pagination pattern
   * 
   * Standard format: {success, message, data}
   * Legacy format: {success, data, pagination}
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

      // Handle legacy pagination pattern
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
    /**
     * HTTP GET request with automatic response unwrapping
     * @param {string} url - Request URL
     * @param {Object} config - Axios config
     * @returns {Promise} Unwrapped response
     */
    get: (url, config) => client.get(url, config).then(unwrapResponse),

    /**
     * HTTP POST request with automatic response unwrapping
     * @param {string} url - Request URL
     * @param {*} data - Request body
     * @param {Object} config - Axios config
     * @returns {Promise} Unwrapped response
     */
    post: (url, data, config) => client.post(url, data, config).then(unwrapResponse),

    /**
     * HTTP PUT request with automatic response unwrapping
     * @param {string} url - Request URL
     * @param {*} data - Request body
     * @param {Object} config - Axios config
     * @returns {Promise} Unwrapped response
     */
    put: (url, data, config) => client.put(url, data, config).then(unwrapResponse),

    /**
     * HTTP DELETE request with automatic response unwrapping
     * @param {string} url - Request URL
     * @param {Object} config - Axios config
     * @returns {Promise} Unwrapped response
     */
    delete: (url, config) => client.delete(url, config).then(unwrapResponse),

    /**
     * HTTP PATCH request with automatic response unwrapping
     * @param {string} url - Request URL
     * @param {*} data - Request body
     * @param {Object} config - Axios config
     * @returns {Promise} Unwrapped response
     */
    patch: (url, data, config) => client.patch(url, data, config).then(unwrapResponse),
  };
}
