/**
 * Array Helper - Collection manipulation utilities
 */
export class Arr {
  /**
   * Get value from nested object using dot notation
   */
  static get(obj, path, defaultValue = null) {
    const value = path.split('.').reduce((current, key) => current?.[key], obj);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set value in nested object using dot notation
   */
  static set(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
    return obj;
  }

  /**
   * Check if array has value
   */
  static has(obj, path) {
    return this.get(obj, path) !== null;
  }

  /**
   * Flatten array
   */
  static flatten(arr, depth = 1) {
    return arr.flat(depth);
  }

  /**
   * Get only specified keys from object
   */
  static only(obj, keys) {
    return keys.reduce((result, key) => {
      if (key in obj) result[key] = obj[key];
      return result;
    }, {});
  }

  /**
   * Get all except specified keys from object
   */
  static except(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }

  /**
   * Pluck values from array of objects
   */
  static pluck(arr, key) {
    return arr.map(item => item[key]);
  }

  /**
   * Group array by key
   */
  static groupBy(arr, key) {
    return arr.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get unique values from array
   */
  static unique(arr) {
    return [...new Set(arr)];
  }

  /**
   * Wrap value in array if not already an array
   */
  static wrap(value) {
    return Array.isArray(value) ? value : [value];
  }
}

export default Arr;
