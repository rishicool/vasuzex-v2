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
   * Now with deep merge support - preserves existing nested properties
   */
  static set(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    // Deep merge if both are objects
    if (typeof target[lastKey] === 'object' && target[lastKey] !== null &&
        typeof value === 'object' && value !== null &&
        !Array.isArray(value) && !Array.isArray(target[lastKey])) {
      target[lastKey] = this.deepMerge(target[lastKey], value);
    } else {
      target[lastKey] = value;
    }
    
    return obj;
  }

  /**
   * Deep merge two objects
   */
  static deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null &&
            !Array.isArray(source[key]) &&
            typeof result[key] === 'object' && result[key] !== null &&
            !Array.isArray(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  }

  /**
   * Transform flat dot-notation keys into nested object structure
   * Example: { 'mail.from.address': 'test@app.com' } => { mail: { from: { address: 'test@app.com' } } }
   */
  static undot(flatObject) {
    const nested = {};
    
    for (const [key, value] of Object.entries(flatObject)) {
      this.set(nested, key, value);
    }
    
    return nested;
  }

  /**
   * Flatten nested object into dot-notation keys
   * Example: { mail: { from: { address: 'test@app.com' } } } => { 'mail.from.address': 'test@app.com' }
   */
  static dot(obj, prefix = '') {
    const result = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, this.dot(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
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

  /**
   * Get first element of array
   */
  static first(arr) {
    return arr[0];
  }

  /**
   * Get last element of array
   */
  static last(arr) {
    return arr[arr.length - 1];
  }
}

export default Arr;
