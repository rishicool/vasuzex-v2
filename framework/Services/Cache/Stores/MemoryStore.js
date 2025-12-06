/**
 * Memory Cache Store
 * In-memory cache store using Map with expiration support
 */

import { Store } from '../Store.js';

export class MemoryStore extends Store {
  constructor(options = {}) {
    super();
    this.cache = new Map();
    this.expirations = new Map();
    this.prefix = options.prefix || 'cache';
    
    // Start cleanup interval (every 60 seconds)
    this.cleanupInterval = setInterval(() => {
      this.cleanExpired();
    }, 60000);
  }

  /**
   * Retrieve an item from the cache by key
   */
  async get(key) {
    const prefixedKey = this.getPrefixedKey(key);

    // Check if expired
    if (this.isExpired(prefixedKey)) {
      await this.forget(key);
      return null;
    }

    return this.cache.get(prefixedKey) || null;
  }

  /**
   * Retrieve multiple items from the cache by key
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
   */
  async put(key, value, seconds) {
    const prefixedKey = this.getPrefixedKey(key);
    
    this.cache.set(prefixedKey, value);
    
    if (seconds > 0) {
      const expiration = Date.now() + (seconds * 1000);
      this.expirations.set(prefixedKey, expiration);
    } else {
      this.expirations.delete(prefixedKey);
    }

    return true;
  }

  /**
   * Store multiple items in the cache for a given number of seconds
   */
  async putMany(values, seconds) {
    for (const [key, value] of Object.entries(values)) {
      await this.put(key, value, seconds);
    }
    
    return true;
  }

  /**
   * Increment the value of an item in the cache
   */
  async increment(key, value = 1) {
    const current = await this.get(key);
    const newValue = (parseInt(current) || 0) + value;
    await this.forever(key, newValue);
    return newValue;
  }

  /**
   * Decrement the value of an item in the cache
   */
  async decrement(key, value = 1) {
    return await this.increment(key, -value);
  }

  /**
   * Store an item in the cache indefinitely
   */
  async forever(key, value) {
    return await this.put(key, value, 0);
  }

  /**
   * Remove an item from the cache
   */
  async forget(key) {
    const prefixedKey = this.getPrefixedKey(key);
    this.cache.delete(prefixedKey);
    this.expirations.delete(prefixedKey);
    return true;
  }

  /**
   * Remove all items from the cache
   */
  async flush() {
    this.cache.clear();
    this.expirations.clear();
    return true;
  }

  /**
   * Get the prefix for cache keys
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Get prefixed key
   */
  getPrefixedKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Check if key is expired
   */
  isExpired(prefixedKey) {
    const expiration = this.expirations.get(prefixedKey);
    
    if (!expiration) {
      return false;
    }

    return expiration < Date.now();
  }

  /**
   * Clean expired cache entries
   */
  cleanExpired() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, expiration] of this.expirations.entries()) {
      if (expiration < now) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      this.expirations.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      expirations: this.expirations.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Destroy the store and cleanup
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.flush();
  }
}

export default MemoryStore;
