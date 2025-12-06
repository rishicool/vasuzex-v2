/**
 * VasuzexProvider
 * 
 * Main provider that combines all Vasuzex providers.
 * Convenience wrapper for AppConfigProvider + ApiClientProvider.
 * 
 * @module providers/VasuzexProvider
 */

import PropTypes from 'prop-types';
import { AppConfigProvider } from './AppConfigProvider.jsx';
import { ApiClientProvider } from './ApiClientProvider.jsx';

/**
 * Combined Vasuzex provider
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.configUrl - URL to fetch config from
 * @param {string} props.apiBaseURL - Base URL for API
 * @param {Object} [props.apiConfig] - Additional axios config
 * @param {Object} [props.defaultConfig] - Default config to use while loading
 * 
 * @example
 * <VasuzexProvider
 *   configUrl="/api/config"
 *   apiBaseURL="https://api.example.com"
 * >
 *   <App />
 * </VasuzexProvider>
 */
export function VasuzexProvider({ 
  children, 
  configUrl, 
  apiBaseURL, 
  apiConfig = {},
  defaultConfig = {} 
}) {
  return (
    <AppConfigProvider configUrl={configUrl} defaultConfig={defaultConfig}>
      <ApiClientProvider baseURL={apiBaseURL} config={apiConfig}>
        {children}
      </ApiClientProvider>
    </AppConfigProvider>
  );
}

VasuzexProvider.propTypes = {
  /** Child components */
  children: PropTypes.node.isRequired,
  /** URL to fetch app configuration from */
  configUrl: PropTypes.string,
  /** API base URL (overrides config) */
  apiBaseURL: PropTypes.string,
  /** Additional API client configuration */
  apiConfig: PropTypes.object,
  /** Default configuration fallback */
  defaultConfig: PropTypes.object,
};

VasuzexProvider.defaultProps = {
  configUrl: '/api/config',
  apiBaseURL: null,
  apiConfig: {},
  defaultConfig: {},
};
