/**
 * AppConfigProvider
 * 
 * Provider for application configuration loaded from backend.
 * Supports loading/error UI screens, caching, and background refresh.
 * 
 * @module providers/AppConfigProvider
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { loadAppConfig } from '../../client/Config/index.js';

const AppConfigContext = createContext(null);

/**
 * Provider component for app configuration
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.configUrl] - URL to fetch config from (default: '/api/config/app-settings')
 * @param {string} [props.apiBaseUrl] - API base URL (default: from VITE_API_BASE_URL or window.ENV)
 * @param {Object} [props.defaultConfig] - Default config to use while loading or on error
 * @param {React.ReactNode} [props.loadingComponent] - Custom loading component
 * @param {React.ReactNode} [props.errorComponent] - Custom error component
 * @param {boolean} [props.showLoadingScreen=true] - Show loading screen while fetching config
 * @param {boolean} [props.showErrorScreen=true] - Show error screen on failure
 * @param {number} [props.cacheDuration] - Cache duration in milliseconds (default: 24 hours)
 * 
 * @example
 * // Basic usage with default loading screen
 * <AppConfigProvider apiBaseUrl="http://localhost:3003/api">
 *   <App />
 * </AppConfigProvider>
 * 
 * @example
 * // Custom loading/error screens
 * <AppConfigProvider 
 *   apiBaseUrl="http://localhost:3003/api"
 *   loadingComponent={<MyCustomLoader />}
 *   errorComponent={<MyCustomError />}
 * >
 *   <App />
 * </AppConfigProvider>
 * 
 * @example
 * // No loading screen, silent background load
 * <AppConfigProvider 
 *   apiBaseUrl="http://localhost:3003/api"
 *   showLoadingScreen={false}
 *   defaultConfig={{ app: { name: 'MyApp' } }}
 * >
 *   <App />
 * </AppConfigProvider>
 */
export function AppConfigProvider({ 
  children, 
  configUrl,
  apiBaseUrl,
  defaultConfig = {},
  loadingComponent,
  errorComponent,
  showLoadingScreen = true,
  showErrorScreen = true,
  cacheDuration,
  versionCheck = false,
  versionUrl
}) {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * Get API base URL from props, env, or window
   */
  const getApiBaseUrl = useCallback(() => {
    if (apiBaseUrl) {
      return apiBaseUrl;
    }
    
    // Try from process.env (webpack DefinePlugin)
    if (typeof process !== 'undefined' && process.env?.API_BASE_URL) {
      return process.env.API_BASE_URL;
    }
    
    // Try from window.ENV (injected at build time)
    if (typeof window !== 'undefined' && window.ENV?.API_BASE_URL) {
      return window.ENV.API_BASE_URL;
    }
    
    // Fallback to current origin + /api
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api`;
    }
    
    throw new Error('API base URL not configured. Please provide apiBaseUrl prop or set API_BASE_URL environment variable.');
  }, [apiBaseUrl]);
  
  /**
   * Load configuration from API
   * Removed dependencies to prevent infinite loop
   */
  const loadConfig = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = getApiBaseUrl();
      const fetchedConfig = await loadAppConfig(baseUrl, {
        forceRefresh,
        cacheDuration,
        configUrl,
        versionCheck,
        versionUrl,
      });
      
      setConfig(fetchedConfig);
    } catch (err) {
      console.error('[AppConfigProvider] Failed to load config:', err);
      setError(err);
      // Keep using defaultConfig on error
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, [getApiBaseUrl, cacheDuration, configUrl, versionCheck, versionUrl]); // Removed defaultConfig from deps
  
  // Load config only once on mount
  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - load once on mount
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    config,
    loading,
    error,
    reload: () => loadConfig(true),
  }), [config, loading, error, loadConfig]);
  
  // Show loading screen while config loads
  if (loading && showLoadingScreen) {
    return (
      <AppConfigContext.Provider value={value}>
        {loadingComponent || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <h2 style={{
              marginTop: '24px',
              fontSize: '20px',
              color: '#374151',
            }}>
              Loading Application...
            </h2>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
      </AppConfigContext.Provider>
    );
  }
  
  // Show error screen if config fails to load
  if (error && showErrorScreen) {
    return (
      <AppConfigContext.Provider value={value}>
        {errorComponent || (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            <div style={{
              maxWidth: '480px',
              padding: '32px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc2626',
                marginBottom: '16px',
              }}>
                Configuration Error
              </h2>
              <p style={{
                color: '#374151',
                marginBottom: '24px',
              }}>
                {error.message || 'Failed to load application configuration'}
              </p>
              <button
                onClick={() => loadConfig(true)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </AppConfigContext.Provider>
    );
  }
  
  // Config loaded successfully - render children
  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

AppConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
  configUrl: PropTypes.string,
  apiBaseUrl: PropTypes.string,
  defaultConfig: PropTypes.object,
  loadingComponent: PropTypes.node,
  errorComponent: PropTypes.node,
  showLoadingScreen: PropTypes.bool,
  showErrorScreen: PropTypes.bool,
  cacheDuration: PropTypes.number,
  versionCheck: PropTypes.bool,
  versionUrl: PropTypes.string,
};

/**
 * Hook to access app config context
 * 
 * @returns {{config: Object, loading: boolean, error: Error|null, reload: Function}}
 * 
 * @example
 * const { config, loading, error, reload } = useAppConfigContext();
 */
export function useAppConfigContext() {
  const context = useContext(AppConfigContext);
  
  if (!context) {
    throw new Error('useAppConfigContext must be used within AppConfigProvider');
  }
  
  return context;
}
