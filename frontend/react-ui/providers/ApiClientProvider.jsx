/**
 * ApiClientProvider
 * 
 * Provider for API client instance.
 * 
 * @module providers/ApiClientProvider
 */

import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const ApiClientContext = createContext(null);

/**
 * Create a configured axios instance
 * @param {Object} config - Axios configuration
 * @returns {AxiosInstance} Configured axios instance
 */
function createApiClient(config) {
  const instance = axios.create(config);
  
  // Add request interceptor for auth token
  instance.interceptors.request.use(
    (requestConfig) => {
      const token = localStorage.getItem('token');
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );
  
  return instance;
}

/**
 * Provider component for API client
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.baseURL - Base URL for API
 * @param {Object} [props.config] - Additional axios config
 * 
 * @example
 * <ApiClientProvider baseURL="https://api.example.com">
 *   <App />
 * </ApiClientProvider>
 */
export function ApiClientProvider({ children, baseURL, config = {} }) {
  const client = useMemo(() => {
    return createApiClient({
      baseURL,
      ...config,
    });
  }, [baseURL, config]);
  
  const value = {
    client,
  };
  
  return (
    <ApiClientContext.Provider value={value}>
      {children}
    </ApiClientContext.Provider>
  );
}

ApiClientProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
  /** API base URL */
  baseURL: PropTypes.string,
  /** Additional API client configuration */
  config: PropTypes.object,
};

ApiClientProvider.defaultProps = {
  baseURL: '/api',
  config: {},
};

/**
 * Hook to access API client context
 * 
 * @returns {{client: Object}} Context with API client instance
 */
export function useApiClientContext() {
  return useContext(ApiClientContext);
}
