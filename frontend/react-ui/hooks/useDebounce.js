/**
 * useDebounce Hook
 * 
 * React hook for debouncing values.
 * Useful for search inputs, API calls, etc.
 * 
 * @module hooks/useDebounce
 */

import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value
 * 
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {*} Debounced value
 * 
 * @example
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *   
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Make API call with debounced value
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *   
 *   return <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />;
 * }
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}
