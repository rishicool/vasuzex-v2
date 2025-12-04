/**
 * Storage Manager
 * Laravel FilesystemManager pattern for Node.js
 * 
 * Manages multiple storage disks (local, s3, custom).
 * 
 * @example
 * import { StorageManager } from 'vasuzex-framework';
 * 
 * const storage = new StorageManager(app);
 * 
 * // Use default disk
 * await storage.put('file.txt', 'contents');
 * 
 * // Use specific disk
 * await storage.disk('s3').put('file.txt', 'contents');
 * const url = await storage.disk('s3').url('file.txt');
 * 
 * // Check existence
 * if (await storage.exists('file.txt')) {
 *   const contents = await storage.get('file.txt');
 * }
 */

import { LocalStorageProvider } from './Providers/LocalStorageProvider.js';
import { S3StorageProvider } from './Providers/S3StorageProvider.js';

export class StorageManager {
  /**
   * Create storage manager
   * @param {Application} app - Application instance
   */
  constructor(app) {
    this.app = app;
    this.disks = {};
    this.customCreators = {};
  }

  /**
   * Get a filesystem disk instance
   * @param {string|null} name - Disk name
   * @returns {BaseStorageProvider}
   */
  disk(name = null) {
    name = name || this.getDefaultDriver();

    if (!this.disks[name]) {
      this.disks[name] = this.resolve(name);
    }

    return this.disks[name];
  }

  /**
   * Get default cloud disk
   * @returns {BaseStorageProvider}
   */
  cloud() {
    const name = this.getDefaultCloudDriver();
    return this.disk(name);
  }

  /**
   * Resolve the given disk
   * @private
   */
  resolve(name) {
    const config = this.getConfig(name);

    if (!config || !config.driver) {
      throw new Error(`Disk [${name}] does not have a configured driver.`);
    }

    const driver = config.driver;

    // Check custom creators first
    if (this.customCreators[driver]) {
      return this.customCreators[driver](this.app, config);
    }

    // Built-in drivers
    const method = `create${this.capitalize(driver)}Driver`;
    
    if (typeof this[method] === 'function') {
      return this[method](config);
    }

    throw new Error(`Driver [${driver}] is not supported.`);
  }

  /**
   * Create local driver
   * @private
   */
  createLocalDriver(config) {
    return new LocalStorageProvider(config);
  }

  /**
   * Create S3 driver
   * @private
   */
  createS3Driver(config) {
    return new S3StorageProvider(config);
  }

  /**
   * Register custom driver creator
   * @param {string} driver - Driver name
   * @param {Function} creator - Creator function
   */
  extend(driver, creator) {
    this.customCreators[driver] = creator;
    return this;
  }

  /**
   * Get disk configuration
   * @private
   */
  getConfig(name) {
    const disks = this.app.config('filesystems.disks', {});
    return disks[name];
  }

  /**
   * Get default driver
   * @private
   */
  getDefaultDriver() {
    return this.app.config('filesystems.default', 'local');
  }

  /**
   * Get default cloud driver
   * @private
   */
  getDefaultCloudDriver() {
    return this.app.config('filesystems.cloud', 's3');
  }

  /**
   * Capitalize string
   * @private
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Proxy methods to default disk
   */
  async put(...args) {
    return await this.disk().put(...args);
  }

  async get(...args) {
    return await this.disk().get(...args);
  }

  async exists(...args) {
    return await this.disk().exists(...args);
  }

  async delete(...args) {
    return await this.disk().delete(...args);
  }

  async url(...args) {
    return await this.disk().url(...args);
  }

  async size(...args) {
    return await this.disk().size(...args);
  }

  async files(...args) {
    return await this.disk().files(...args);
  }

  async copy(...args) {
    return await this.disk().copy(...args);
  }

  async move(...args) {
    return await this.disk().move(...args);
  }
}

export default StorageManager;
