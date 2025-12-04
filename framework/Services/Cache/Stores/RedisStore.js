/**
 * Redis Cache Store
 * Laravel-inspired Redis cache store
 */

import { Store } from '../Store.js';

export class RedisStore extends Store {
  constructor(redis, options = {}) {
    super();
    this.redis = redis;
    this.prefix = options.prefix || 'cache:';
  }

  /**
   * Retrieve an item from the cache by key
   */
  async get(key) {
    const value = await this.redis.get(this.prefix + key);
    
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  /**
   * Retrieve multiple items from the cache by key
   */
  async many(keys) {
    const prefixedKeys = keys.map(key => this.prefix + key);
    const values = await this.redis.mget(prefixedKeys);
    
    const result = {};
    keys.forEach((key, index) => {
      const value = values[index];
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch (e) {
          result[key] = value;
        }
      } else {
        result[key] = null;
      }
    });

    return result;
  }

  /**
   * Store an item in the cache for a given number of seconds
   */
  async put(key, value, seconds) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (seconds > 0) {
      await this.redis.setex(this.prefix + key, seconds, serialized);
    } else {
      await this.redis.set(this.prefix + key, serialized);
    }

    return true;
  }

  /**
   * Store multiple items in the cache for a given number of seconds
   */
  async putMany(values, seconds) {
    const pipeline = this.redis.pipeline();
    
    for (const [key, value] of Object.entries(values)) {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (seconds > 0) {
        pipeline.setex(this.prefix + key, seconds, serialized);
      } else {
        pipeline.set(this.prefix + key, serialized);
      }
    }

    await pipeline.exec();
    return true;
  }

  /**
   * Increment the value of an item in the cache
   */
  async increment(key, value = 1) {
    return await this.redis.incrby(this.prefix + key, value);
  }

  /**
   * Decrement the value of an item in the cache
   */
  async decrement(key, value = 1) {
    return await this.redis.decrby(this.prefix + key, value);
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
    await this.redis.del(this.prefix + key);
    return true;
  }

  /**
   * Remove all items from the cache
   */
  async flush() {
    const keys = await this.redis.keys(this.prefix + '*');
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    return true;
  }

  /**
   * Get the cache key prefix
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Get the Redis connection
   */
  connection() {
    return this.redis;
  }
}

export default RedisStore;
