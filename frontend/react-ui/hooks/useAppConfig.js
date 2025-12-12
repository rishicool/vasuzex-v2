/**
 * useAppConfig Hook
 * 
 * React hook for accessing application configuration.
 * Must be used within AppConfigProvider.
 * 
 * @module hooks/useAppConfig
 */

import { useAppConfigContext } from '../providers/AppConfigProvider.jsx';

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-separated path (e.g., 'app.name')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Value at path or defaultValue
 * 
 * @example
 * getNestedValue({ app: { name: 'MyApp' } }, 'app.name') // 'MyApp'
 * getNestedValue({ app: { name: 'MyApp' } }, 'app.missing', 'Default') // 'Default'
 */
function getNestedValue(obj, path, defaultValue = undefined) {
  if (!obj || !path) {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Hook to access application configuration
 * 
 * @returns {{
 *   config: Object, 
 *   loading: boolean, 
 *   error: Error|null, 
 *   reload: Function,
 *   get: Function
 * }} Config object and loading state
 * 
 * @example
 * function MyComponent() {
 *   const { config, loading, error, get } = useAppConfig();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return (
 *     <div>
 *       <h1>{get('app.name', 'Default App')}</h1>
 *       <p>Version: {get('app.version')}</p>
 *       {get('features.darkMode') && <DarkModeToggle />}
 *     </div>
 *   );
 * }
 */
export function useAppConfig() {
  const context = useAppConfigContext();
  
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  
  /**
   * Get nested config value using dot notation
   * @param {string} path - Dot-separated path (e.g., 'app.name')
   * @param {*} defaultValue - Default value if path not found
   * @returns {*} Value at path or defaultValue
   */
  const get = (path, defaultValue) => {
    return getNestedValue(context.config, path, defaultValue);
  };
  
  return {
    ...context,
    get,
  };
}
