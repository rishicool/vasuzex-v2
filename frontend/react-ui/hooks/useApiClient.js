/**
 * useApiClient Hook
 * 
 * React hook for accessing the API client instance.
 * Must be used within ApiClientProvider.
 * 
 * @module hooks/useApiClient
 */

import { useApiClientContext } from '../providers/ApiClientProvider.jsx';

/**
 * Hook to access the API client
 * 
 * @returns {Object} API client instance from @vasuzex/client
 * 
 * @example
 * function MyComponent() {
 *   const apiClient = useApiClient();
 *   
 *   const fetchData = async () => {
 *     const data = await apiClient.get('/api/posts');
 *     console.log(data);
 *   };
 *   
 *   return <button onClick={fetchData}>Fetch Data</button>;
 * }
 */
export function useApiClient() {
  const context = useApiClientContext();
  
  if (!context) {
    throw new Error('useApiClient must be used within ApiClientProvider');
  }
  
  return context.client;
}
