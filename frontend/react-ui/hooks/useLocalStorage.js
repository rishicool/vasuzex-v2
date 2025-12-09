/**
 * useLocalStorage Hook
 * 
 * React hook for syncing state with localStorage.
 * 
 * @module hooks/useLocalStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from 'vasuzex/client/Storage';

/**
 * Hook to sync state with localStorage
 * 
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function, Function]} Value, setter, and remover
 * 
 * @example
 * function MyComponent() {
 *   const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *   
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <button onClick={() => setTheme('dark')}>Dark Mode</button>
 *       <button onClick={removeTheme}>Reset</button>
 *     </div>
 *   );
 * }
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = storage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      storage.remove(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          setStoredValue(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue, removeValue];
}
