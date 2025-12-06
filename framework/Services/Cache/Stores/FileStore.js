/**
 * File Cache Store
 * File-based cache store with expiration support
 */

import { Store } from '../Store.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class FileStore extends Store {
  constructor(options = {}) {
    super();
    this.path = options.path || 'storage/framework/cache';
    this.prefix = options.prefix || 'cache';
    this.ensureCacheDirectory();
  }

  /**
   * Retrieve an item from the cache by key
   */
  async get(key) {
    const filePath = this.getFilePath(key);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      // Check if expired
      if (data.expiration && data.expiration < Date.now()) {
        await this.forget(key);
        return null;
      }

      return data.value;
    } catch (error) {
      return null;
    }
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
    const filePath = this.getFilePath(key);
    const expiration = seconds > 0 ? Date.now() + (seconds * 1000) : null;

    const data = {
      value,
      expiration
    };

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data), 'utf8');
      return true;
    } catch (error) {
      console.error(`Failed to write cache file: ${error.message}`);
      return false;
    }
  }

  /**
   * Store multiple items in the cache for a given number of seconds
   */
  async putMany(values, seconds) {
    const promises = Object.entries(values).map(([key, value]) =>
      this.put(key, value, seconds)
    );

    await Promise.all(promises);
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
    const filePath = this.getFilePath(key);

    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  }

  /**
   * Remove all items from the cache
   */
  async flush() {
    try {
      const files = await fs.promises.readdir(this.path);
      const deletePromises = files
        .filter(file => file.startsWith(this.prefix))
        .map(file => fs.promises.unlink(path.join(this.path, file)));

      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the prefix for cache keys
   */
  getPrefix() {
    return this.prefix;
  }

  /**
   * Get file path for cache key
   */
  getFilePath(key) {
    const hash = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.path, `${this.prefix}_${hash}.cache`);
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDirectory() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path, { recursive: true });
    }
  }

  /**
   * Clean expired cache files
   */
  async cleanExpired() {
    try {
      const files = await fs.promises.readdir(this.path);
      const now = Date.now();

      for (const file of files) {
        if (!file.startsWith(this.prefix)) continue;

        const filePath = path.join(this.path, file);
        try {
          const content = await fs.promises.readFile(filePath, 'utf8');
          const data = JSON.parse(content);

          if (data.expiration && data.expiration < now) {
            await fs.promises.unlink(filePath);
          }
        } catch (error) {
          // Ignore errors for individual files
        }
      }
    } catch (error) {
      console.error(`Failed to clean expired cache: ${error.message}`);
    }
  }
}

export default FileStore;
