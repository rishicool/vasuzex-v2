/**
 * Config Repository
 * Laravel-inspired configuration repository with dot notation access
 * 
 * Stores file-based configurations in memory and provides convenient access methods.
 * For database-driven configs, use DatabaseConfigService separately.
 * 
 * @example
 * import { ConfigRepository } from 'vasuzex-framework';
 * 
 * const config = new ConfigRepository({
 *   'app.name': 'neasto',
 *   'database.host': 'localhost'
 * });
 * 
 * config.get('app.name'); // 'neasto'
 * config.get('database.connection.host', 'localhost'); // with fallback
 * config.set('app.debug', true);
 * config.has('database.host'); // true
 */

import { Arr } from '../Support/Arr.js';

export class ConfigRepository {
  /**
   * All of the configuration items
   * @private
   */
  #items = {};

  /**
   * Create a new configuration repository
   * @param {Object} items - Initial configuration items
   */
  constructor(items = {}) {
    this.#items = items;
  }

  /**
   * Determine if the given configuration value exists
   * @param {string} key - Dot notation key
   * @returns {boolean}
   */
  has(key) {
    return Arr.has(this.#items, key);
  }

  /**
   * Get the specified configuration value
   * @param {string|array} key - Dot notation key or array of keys
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*}
   */
  get(key, defaultValue = null) {
    if (Array.isArray(key)) {
      return this.getMany(key);
    }

    return Arr.get(this.#items, key, defaultValue);
  }

  /**
   * Get many configuration values
   * @param {Array} keys - Array of keys
   * @returns {Object}
   */
  getMany(keys) {
    const config = {};

    for (const item of keys) {
      let key, defaultValue;

      if (typeof item === 'string') {
        key = item;
        defaultValue = null;
      } else {
        // Support { 'key': 'default' } format
        [key, defaultValue] = Object.entries(item)[0];
      }

      config[key] = Arr.get(this.#items, key, defaultValue);
    }

    return config;
  }

  /**
   * Set a given configuration value
   * @param {string|Object} key - Dot notation key or object of key-value pairs
   * @param {*} value - Value to set
   */
  set(key, value = null) {
    const keys = typeof key === 'object' && !Array.isArray(key) ? key : { [key]: value };

    for (const [k, v] of Object.entries(keys)) {
      Arr.set(this.#items, k, v);
    }
  }

  /**
   * Prepend a value onto an array configuration value
   * @param {string} key - Dot notation key
   * @param {*} value - Value to prepend
   */
  prepend(key, value) {
    const array = this.get(key, []);
    
    if (!Array.isArray(array)) {
      throw new Error(`Config value at "${key}" is not an array`);
    }

    array.unshift(value);
    this.set(key, array);
  }

  /**
   * Push a value onto an array configuration value
   * @param {string} key - Dot notation key
   * @param {*} value - Value to push
   */
  push(key, value) {
    const array = this.get(key, []);
    
    if (!Array.isArray(array)) {
      throw new Error(`Config value at "${key}" is not an array`);
    }

    array.push(value);
    this.set(key, array);
  }

  /**
   * Get all of the configuration items
   * @returns {Object}
   */
  all() {
    return { ...this.#items };
  }

  /**
   * Merge new configuration items
   * @param {Object} items - Configuration items to merge
   */
  merge(items) {
    this.#items = { ...this.#items, ...items };
  }

  /**
   * Clear all configuration items
   */
  clear() {
    this.#items = {};
  }

  /**
   * Reload configuration from database
   * Useful for runtime config changes without restart
   * 
   * @param {Application} app - Application instance (optional, for accessing DatabaseConfigService)
   * @returns {Promise<void>}
   * @example
   * // Reload database configs
   * await Config.reloadFromDatabase(app);
   */
  async reloadFromDatabase(app) {
    if (!app) {
      console.warn('[ConfigRepository] Cannot reload from database: app instance not provided');
      return;
    }

    try {
      const dbConfigService = app.make('db.config');
      if (dbConfigService) {
        await dbConfigService.reload();
        console.log('[ConfigRepository] Reloaded configs from database');
      }
    } catch (error) {
      console.error('[ConfigRepository] Failed to reload from database:', error.message);
    }
  }

  /**
   * Get nested configuration as object
   * @param {string} prefix - Prefix to filter by
   * @returns {Object}
   * @example
   * config.getNested('mail'); // Returns all mail.* configs as nested object
   */
  getNested(prefix) {
    const result = {};
    const prefixWithDot = prefix + '.';
    
    for (const [key, value] of Object.entries(this.#items)) {
      if (key === prefix) {
        return value;
      }
      if (key.startsWith(prefixWithDot)) {
        const subKey = key.substring(prefixWithDot.length);
        const keys = subKey.split('.');
        let current = result;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      }
    }
    
    return result;
  }
}

export default ConfigRepository;
