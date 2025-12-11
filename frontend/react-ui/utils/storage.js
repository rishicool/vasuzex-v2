/**
 * Type-safe localStorage utilities
 *
 * Simple and straightforward localStorage operations with error handling
 * and optional JSON parsing/stringifying.
 * 
 * @module @vasuzex/react/utils/storage
 */

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @param {boolean} [parseJson] - If true, automatically parse JSON
 * @returns {any} The item value or null if not found
 */
export function getStorageItem(key, parseJson) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    if (parseJson) {
      return JSON.parse(item);
    }

    return item;
  } catch (error) {
    console.error(`Error reading from localStorage [${key}]:`, error);
    return null;
  }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {boolean} [stringifyJson] - If true, automatically stringify as JSON
 */
export function setStorageItem(key, value, stringifyJson) {
  try {
    const item = stringifyJson ? JSON.stringify(value) : value;
    localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage [${key}]:`, error);
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key to remove
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage [${key}]:`, error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clearStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if key exists in localStorage
 * @param {string} key - Storage key to check
 * @returns {boolean} true if key exists, false otherwise
 */
export function hasStorageItem(key) {
  return localStorage.getItem(key) !== null;
}

/**
 * Convenience object with all storage utilities
 */
export const storage = {
  get: getStorageItem,
  set: setStorageItem,
  remove: removeStorageItem,
  clear: clearStorage,
  has: hasStorageItem,
};

export default storage;
