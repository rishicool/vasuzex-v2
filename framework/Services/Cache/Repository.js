/**
 * Cache Repository
 * Laravel-inspired cache repository
 */

export class Repository {
  constructor(store) {
    this.store = store;
    this.default = 3600; // 1 hour default
  }

  /**
   * Determine if an item exists in the cache
   */
  async has(key) {
    return (await this.get(key)) !== null;
  }

  /**
   * Determine if an item doesn't exist in the cache
   */
  async missing(key) {
    return !(await this.has(key));
  }

  /**
   * Retrieve an item from the cache by key
   */
  async get(key, defaultValue = null) {
    if (Array.isArray(key)) {
      return await this.many(key);
    }

    const value = await this.store.get(key);

    return value !== null ? value : (typeof defaultValue === 'function' ? defaultValue() : defaultValue);
  }

  /**
   * Retrieve multiple items from the cache by key
   */
  async many(keys) {
    return await this.store.many(keys);
  }

  /**
   * Retrieve an item from the cache and delete it
   */
  async pull(key, defaultValue = null) {
    const value = await this.get(key, defaultValue);
    await this.forget(key);
    return value;
  }

  /**
   * Store an item in the cache
   */
  async put(key, value, ttl = null) {
    const seconds = this.getSeconds(ttl);
    return await this.store.put(key, value, seconds);
  }

  /**
   * Store multiple items in the cache
   */
  async putMany(values, ttl = null) {
    const seconds = this.getSeconds(ttl);
    return await this.store.putMany(values, seconds);
  }

  /**
   * Store an item in the cache if the key does not exist
   */
  async add(key, value, ttl = null) {
    if (await this.missing(key)) {
      return await this.put(key, value, ttl);
    }
    return false;
  }

  /**
   * Increment the value of an item in the cache
   */
  async increment(key, value = 1) {
    return await this.store.increment(key, value);
  }

  /**
   * Decrement the value of an item in the cache
   */
  async decrement(key, value = 1) {
    return await this.store.decrement(key, value);
  }

  /**
   * Store an item in the cache indefinitely
   */
  async forever(key, value) {
    return await this.store.forever(key, value);
  }

  /**
   * Get an item from the cache, or execute the given Closure and store the result
   */
  async remember(key, ttl, callback) {
    const value = await this.get(key);

    if (value !== null) {
      return value;
    }

    const result = await callback();
    await this.put(key, result, ttl);

    return result;
  }

  /**
   * Get an item from the cache, or execute the given Closure and store the result forever
   */
  async rememberForever(key, callback) {
    const value = await this.get(key);

    if (value !== null) {
      return value;
    }

    const result = await callback();
    await this.forever(key, result);

    return result;
  }

  /**
   * Remove an item from the cache
   */
  async forget(key) {
    return await this.store.forget(key);
  }

  /**
   * Remove all items from the cache
   */
  async flush() {
    return await this.store.flush();
  }

  /**
   * Get the cache store implementation
   */
  getStore() {
    return this.store;
  }

  /**
   * Calculate the number of seconds for the given TTL
   */
  getSeconds(ttl) {
    if (ttl === null) {
      return this.default;
    }

    if (typeof ttl === 'number') {
      return ttl;
    }

    if (ttl instanceof Date) {
      return Math.max(0, Math.floor((ttl.getTime() - Date.now()) / 1000));
    }

    return this.default;
  }

  /**
   * Set the default cache time in seconds
   */
  setDefaultCacheTime(seconds) {
    this.default = seconds;
    return this;
  }

  /**
   * Get the default cache time in seconds
   */
  getDefaultCacheTime() {
    return this.default;
  }
}

export default Repository;
