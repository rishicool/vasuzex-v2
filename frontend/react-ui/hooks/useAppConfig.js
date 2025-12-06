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
 * Hook to access application configuration
 * 
 * @returns {{config: Object, loading: boolean, error: Error|null, reload: Function}} Config object and loading state
 * 
 * @example
 * function MyComponent() {
 *   const { config, loading, error } = useAppConfig();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <div>App: {config.app.name}</div>;
 * }
 */
export function useAppConfig() {
  const context = useAppConfigContext();
  
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  
  return context;
}
