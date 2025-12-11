/**
 * DatabaseConfigService
 * Loads runtime configurations from database (app_configs and system_configs tables)
 * and merges them into the ConfigRepository
 * 
 * Similar to Laravel's database-driven config but integrated with Vasuzex's ConfigRepository
 * 
 * @example
 * import { DatabaseConfigService } from '#framework/Config/DatabaseConfigService.js';
 * 
 * const dbConfigService = new DatabaseConfigService(app);
 * await dbConfigService.load();
 * 
 * // Now access via config()
 * app.config('phonepe.merchantId'); // From database
 * app.config('app.name'); // From file-based config
 */

export class DatabaseConfigService {
  /**
   * Application instance
   * @private
   */
  #app = null;

  /**
   * Cache for database configs
   * @private
   */
  #cache = {
    appConfigs: null,
    systemConfigs: null,
    lastLoadTime: null,
  };

  /**
   * Cache duration in milliseconds (5 minutes)
   * @private
   */
  #cacheDuration = 5 * 60 * 1000;

  /**
   * Current environment
   * @private
   */
  #environment = 'all';

  /**
   * Create a new database config service
   * @param {Application} app - Application instance
   * @param {Object} options - Service options
   */
  constructor(app, options = {}) {
    this.#app = app;
    this.#environment = options.environment || process.env.NODE_ENV || 'development';
    this.#cacheDuration = options.cacheDuration || this.#cacheDuration;
  }

  /**
   * Load database configs and merge into ConfigRepository
   * @returns {Promise<void>}
   */
  async load() {
    try {
      // Check if cache is valid
      if (this.#isCacheValid()) {
        console.log('[DatabaseConfigService] Using cached configs');
        this.#mergeIntoConfigRepository();
        return;
      }

      console.log('[DatabaseConfigService] Loading configs from database...');

      // Load configs from database
      await this.#loadAppConfigs();
      await this.#loadSystemConfigs();

      // Update cache timestamp
      this.#cache.lastLoadTime = Date.now();

      // Merge into ConfigRepository
      this.#mergeIntoConfigRepository();

      console.log('[DatabaseConfigService] Configs loaded successfully');
    } catch (error) {
      console.error('[DatabaseConfigService] Failed to load configs:', error.message);
      // Don't throw - app should still work with file-based configs
    }
  }

  /**
   * Reload configs from database (bypass cache)
   * @returns {Promise<void>}
   */
  async reload() {
    this.#cache.lastLoadTime = null;
    await this.load();
  }

  /**
   * Get config value directly from database (bypass ConfigRepository)
   * @param {string} key - Config key
   * @param {*} defaultValue - Default value
   * @returns {Promise<*>}
   */
  async getDirect(key, defaultValue = null) {
    // Try app_configs first
    const AppConfig = await this.#getModel('AppConfig');
    if (AppConfig) {
      const value = await AppConfig.getValue(key, this.#environment, null);
      if (value !== null) {
        return value;
      }
    }

    // Try system_configs
    const SystemConfig = await this.#getModel('SystemConfig');
    if (SystemConfig) {
      const value = await SystemConfig.getValue(key, this.#environment, null);
      if (value !== null) {
        return value;
      }
    }

    return defaultValue;
  }

  /**
   * Set config value in database
   * @param {string} key - Config key
   * @param {*} value - Config value
   * @param {Object} options - Additional options (category, description, etc.)
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    const {
      type = 'app', // 'app' or 'system'
      category = 'app',
      description = '',
      is_public = false,
      is_active = true,
      environment = this.#environment,
    } = options;

    const Model = await this.#getModel(type === 'app' ? 'AppConfig' : 'SystemConfig');

    if (!Model) {
      throw new Error(`Model not found for type: ${type}`);
    }

    await Model.setValue(key, value, {
      category,
      description,
      is_public,
      is_active,
      environment,
    });

    // Invalidate cache
    this.#cache.lastLoadTime = null;

    // Reload configs
    await this.load();
  }

  /**
   * Delete config from database
   * @param {string} key - Config key
   * @param {string} type - Config type ('app' or 'system')
   * @returns {Promise<boolean>}
   */
  async delete(key, type = 'app') {
    const Model = await this.#getModel(type === 'app' ? 'AppConfig' : 'SystemConfig');

    if (!Model) {
      return false;
    }

    const result = await Model.deleteByKey(key, this.#environment);

    // Invalidate cache
    this.#cache.lastLoadTime = null;

    return result;
  }

  /**
   * Get all database configs as object
   * @returns {Object}
   */
  getAllDatabaseConfigs() {
    return {
      app: this.#cache.appConfigs || {},
      system: this.#cache.systemConfigs || {},
    };
  }

  /**
   * Load app_configs from database
   * @private
   */
  async #loadAppConfigs() {
    const AppConfig = await this.#getModel('AppConfig');

    if (!AppConfig) {
      console.warn('[DatabaseConfigService] AppConfig model not found');
      this.#cache.appConfigs = {};
      return;
    }

    const configs = await AppConfig.getAllAsObject(this.#environment);
    this.#cache.appConfigs = configs;
  }

  /**
   * Load system_configs from database
   * @private
   */
  async #loadSystemConfigs() {
    const SystemConfig = await this.#getModel('SystemConfig');

    if (!SystemConfig) {
      console.warn('[DatabaseConfigService] SystemConfig model not found');
      this.#cache.systemConfigs = {};
      return;
    }

    const configs = await SystemConfig.getAllAsObject(this.#environment);
    this.#cache.systemConfigs = configs;
  }

  /**
   * Merge database configs into ConfigRepository
   * @private
   */
  #mergeIntoConfigRepository() {
    const config = this.#app.make('config');

    if (!config) {
      throw new Error('[DatabaseConfigService] ConfigRepository not found in container');
    }

    // Merge app_configs
    if (this.#cache.appConfigs) {
      for (const [key, value] of Object.entries(this.#cache.appConfigs)) {
        config.set(key, value);
      }
    }

    // Merge system_configs
    if (this.#cache.systemConfigs) {
      for (const [key, value] of Object.entries(this.#cache.systemConfigs)) {
        config.set(key, value);
      }
    }
  }

  /**
   * Check if cache is still valid
   * @private
   */
  #isCacheValid() {
    if (!this.#cache.lastLoadTime) {
      return false;
    }

    const elapsed = Date.now() - this.#cache.lastLoadTime;
    return elapsed < this.#cacheDuration;
  }

  /**
   * Get model from container or require it
   * @private
   */
  async #getModel(modelName) {
    try {
      // Try to get from container first
      if (this.#app.has(modelName)) {
        return this.#app.make(modelName);
      }

      // Dynamic import needs path module
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      // Try to require dynamically from project's database/models/
      const cwd = process.cwd();
      
      // Try multiple paths to find models
      const possiblePaths = [
        path.default.join(cwd, 'database', 'models', `${modelName}.js`), // If cwd is monorepo root
        path.default.join(cwd, '..', '..', '..', 'database', 'models', `${modelName}.js`), // If cwd is apps/*/api
        path.default.join(cwd, '..', '..', 'database', 'models', `${modelName}.js`), // If cwd is apps/*
      ];
      
      let Model = null;
      for (const modelPath of possiblePaths) {
        try {
          const module = await import(modelPath);
          Model = module.default || module[modelName];
          if (Model) {
            console.log(`[DatabaseConfigService] Loaded ${modelName} from ${modelPath}`);
            break;
          }
        } catch (err) {
          // Try next path
        }
      }
      
      if (!Model) {
        throw new Error(`Model ${modelName} not found in paths: ${possiblePaths.join(', ')}`);
      }
      
      return Model;
    } catch (error) {
      console.warn(`[DatabaseConfigService] Could not load model ${modelName}:`, error.message);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.#cache = {
      appConfigs: null,
      systemConfigs: null,
      lastLoadTime: null,
    };
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getCacheStats() {
    return {
      isValid: this.#isCacheValid(),
      lastLoadTime: this.#cache.lastLoadTime,
      appConfigsCount: Object.keys(this.#cache.appConfigs || {}).length,
      systemConfigsCount: Object.keys(this.#cache.systemConfigs || {}).length,
      cacheAge: this.#cache.lastLoadTime ? Date.now() - this.#cache.lastLoadTime : null,
      cacheDuration: this.#cacheDuration,
    };
  }
}

export default DatabaseConfigService;
