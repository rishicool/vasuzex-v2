/**
 * Cache Store Interface
 * Laravel-inspired cache store contract
 */

export class Store {
  /**
   * Retrieve an item from the cache by key
   * @param {string} key
   * @returns {Promise<any>}
   */
  async get(key) {
    throw new Error('Method get() must be implemented');
  }

  /**
   * Retrieve multiple items from the cache by key
   * @param {Array<string>} keys
   * @returns {Promise<Object>}
   */
  async many(keys) {
    const result = {};
    for (const key of keys) {
      result[key] = await this.get(key);
    }
    return result;
  }

  /**
   * Store an item in the cache for a given number of seconds
   * @param {string} key
   * @param {any} value
   * @param {number} seconds
   * @returns {Promise<boolean>}
   */
  async put(key, value, seconds) {
    throw new Error('Method put() must be implemented');
  }

  /**
   * Store multiple items in the cache for a given number of seconds
   * @param {Object} values
   * @param {number} seconds
   * @returns {Promise<boolean>}
   */
  async putMany(values, seconds) {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, seconds);
    }
    return true;
  }

  /**
   * Increment the value of an item in the cache
   * @param {string} key
   * @param {number} value
   * @returns {Promise<number|boolean>}
   */
  async increment(key, value = 1) {
    throw new Error('Method increment() must be implemented');
  }

  /**
   * Decrement the value of an item in the cache
   * @param {string} key
   * @param {number} value
   * @returns {Promise<number|boolean>}
   */
  async decrement(key, value = 1) {
    throw new Error('Method decrement() must be implemented');
  }

  /**
   * Store an item in the cache indefinitely
   * @param {string} key
   * @param {any} value
   * @returns {Promise<boolean>}
   */
  async forever(key, value) {
    throw new Error('Method forever() must be implemented');
  }

  /**
   * Remove an item from the cache
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async forget(key) {
    throw new Error('Method forget() must be implemented');
  }

  /**
   * Remove all items from the cache
   * @returns {Promise<boolean>}
   */
  async flush() {
    throw new Error('Method flush() must be implemented');
  }

  /**
   * Get the cache key prefix
   * @returns {string}
   */
  getPrefix() {
    return '';
  }
}

export default Store;
