/**
 * Array Cache Store
 * Laravel-inspired in-memory cache store
 */

import { Store } from '../Store.js';

export class ArrayStore extends Store {
  constructor(options = {}) {
    super();
    this.storage = new Map();
    this.prefix = options.prefix || '';
  }

  /**
   * Retrieve an item from the cache by key
   */
  async get(key) {
    const item = this.storage.get(this.prefix + key);
    
    if (!item) {
      return null;
    }

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      await this.forget(key);
      return null;
    }

    return item.value;
  }

  /**
   * Store an item in the cache for a given number of seconds
   */
  async put(key, value, seconds) {
    const expiresAt = seconds > 0 ? Date.now() + (seconds * 1000) : null;
    
    this.storage.set(this.prefix + key, {
      value,
      expiresAt
    });

    return true;
  }

  /**
   * Increment the value of an item in the cache
   */
  async increment(key, value = 1) {
    const current = await this.get(key) || 0;
    const newValue = Number(current) + value;
    
    await this.put(key, newValue, 0);
    
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
    this.storage.delete(this.prefix + key);
    return true;
  }

  /**
   * Remove all items from the cache
   */
  async flush() {
    this.storage.clear();
    return true;
  }

  /**
   * Get the cache key prefix
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Get all items in the cache
   */
  all() {
    const result = {};
    for (const [key, item] of this.storage.entries()) {
      if (!item.expiresAt || Date.now() <= item.expiresAt) {
        result[key.replace(this.prefix, '')] = item.value;
      }
    }
    return result;
  }
}

export default ArrayStore;
