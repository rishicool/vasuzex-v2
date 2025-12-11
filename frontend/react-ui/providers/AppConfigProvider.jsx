/**
 * AppConfigProvider
 * 
 * Provider for application configuration loaded from backend.
 * 
 * @module providers/AppConfigProvider
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { loadAppConfig } from '../utils/index.js';

const AppConfigContext = createContext(null);

/**
 * Provider component for app configuration
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.configUrl - URL to fetch config from
 * @param {Object} [props.defaultConfig] - Default config to use while loading
 * 
 * @example
 * <AppConfigProvider configUrl="/api/config">
 *   <App />
 * </AppConfigProvider>
 */
export function AppConfigProvider({ children, configUrl, defaultConfig = {} }) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedConfig = await loadAppConfig(configUrl);
      setConfig(fetchedConfig);
    } catch (err) {
      console.error('Failed to load app config:', err);
      setError(err);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [configUrl, defaultConfig]);
  
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);
  
  const value = {
    config,
    loading,
    error,
    reload: loadConfig,
  };
  
  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

AppConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
  configUrl: PropTypes.string,
  defaultConfig: PropTypes.object,
};

AppConfigProvider.defaultProps = {
  configUrl: '/api/config',
  defaultConfig: {},
};

/**
 * Hook to access app config context
 * 
 * @returns {{config: Object, loading: boolean, error: Error|null, reload: Function}}
 */
export function useAppConfigContext() {
  return useContext(AppConfigContext);
}
