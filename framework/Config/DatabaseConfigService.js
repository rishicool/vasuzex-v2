/**
 * DatabaseConfigService
 * Loads runtime configurations from database (app_configs table ONLY)
 * and merges them into the ConfigRepository
 * 
 * UNIFIED: system_configs has been merged into app_configs with scope column
 * - scope='app' → Frontend configs (for web/mobile apps)
 * - scope='api' → Backend configs (loaded into Config facade)
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
 * app.config('PLATFORM_FEES'); // From database (scope='api')
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
    apiConfigs: null,      // Backend configs (scope='api')
    appConfigs: null,      // Frontend configs (scope='app') - for reference only
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

      // Load API configs (scope='api') - for backend/Config facade
      await this.#loadApiConfigs();

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
   * @param {string} scope - Config scope ('app' or 'api')
   * @param {*} defaultValue - Default value
   * @returns {Promise<*>}
   */
  async getDirect(key, scope = 'api', defaultValue = null) {
    const AppConfig = await this.#getModel('AppConfig');
    if (AppConfig) {
      const value = await AppConfig.getTypedValue(key, scope, defaultValue);
      return value;
    }
    return defaultValue;
  }

  /**
   * Set config value in database
   * @param {string} key - Config key
   * @param {*} value - Config value
   * @param {Object} options - Additional options (scope, category, description, etc.)
   * @returns {Promise<void>}
   */
  async set(key, value, options = {}) {
    const {
      scope = 'api',         // 'app' or 'api'
      category = 'app',
      description = '',
      access_level = 'internal',
      data_type = 'string',
      is_active = true,
      environment = this.#environment,
    } = options;

    const AppConfig = await this.#getModel('AppConfig');

    if (!AppConfig) {
      throw new Error('AppConfig model not found');
    }

    // Serialize value based on type
    let serializedValue = value;
    if (data_type === 'array' || data_type === 'object') {
      serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    } else if (data_type === 'boolean') {
      serializedValue = value ? 'true' : 'false';
    } else {
      serializedValue = String(value);
    }

    // Upsert the config
    const existing = await AppConfig.query()
      .where('key', key)
      .where('scope', scope)
      .where('environment', environment)
      .first();

    if (existing) {
      await AppConfig.where('id', existing.id).update({
        value: serializedValue,
        category,
        description,
        access_level,
        data_type,
        is_active,
      });
    } else {
      await AppConfig.create({
        key,
        value: serializedValue,
        scope,
        category,
        description,
        access_level,
        data_type,
        is_active,
        environment,
      });
    }

    // Invalidate cache
    this.#cache.lastLoadTime = null;

    // Reload configs
    await this.load();
  }

  /**
   * Delete config from database
   * @param {string} key - Config key
   * @param {string} scope - Config scope ('app' or 'api')
   * @returns {Promise<boolean>}
   */
  async delete(key, scope = 'api') {
    const AppConfig = await this.#getModel('AppConfig');

    if (!AppConfig) {
      return false;
    }

    await AppConfig.query()
      .where('key', key)
      .where('scope', scope)
      .where('environment', this.#environment)
      .delete();

    // Invalidate cache
    this.#cache.lastLoadTime = null;

    return true;
  }

  /**
   * Get all database configs as object
   * @returns {Object}
   */
  getAllDatabaseConfigs() {
    return {
      api: this.#cache.apiConfigs || {},
      app: this.#cache.appConfigs || {},
    };
  }

  /**
   * Load API configs (scope='api' and scope='all') from database
   * These are the backend configs that get loaded into Config facade
   * scope='all' means shared between frontend and backend (no duplication)
   * @private
   */
  async #loadApiConfigs() {
    const AppConfig = await this.#getModel('AppConfig');

    if (!AppConfig) {
      console.warn('[DatabaseConfigService] AppConfig model not found');
      this.#cache.apiConfigs = {};
      return;
    }

    // Load API-scoped AND shared (scope='all') configs for backend
    const configs = await AppConfig.query()
      .whereIn('scope', ['api', 'app', 'all'])
      .where('is_active', true)
      .where((query) => {
        query.where('environment', this.#environment)
          .orWhere('environment', 'all');
      })
      .get();

    // Transform to key-value object with type casting
    const result = {};
    for (const config of configs) {
      result[config.key] = AppConfig.castValue(config.value, config.data_type);
    }

    this.#cache.apiConfigs = result;
  }

  /**
   * Merge database configs into ConfigRepository
   * Only API-scoped configs are merged (frontend configs stay in DB)
   * @private
   */
  #mergeIntoConfigRepository() {
    const config = this.#app.make('config');

    if (!config) {
      throw new Error('[DatabaseConfigService] ConfigRepository not found in container');
    }

    // Merge only API configs (backend configs)
    if (this.#cache.apiConfigs) {
      for (const [key, value] of Object.entries(this.#cache.apiConfigs)) {
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
      apiConfigs: null,
      appConfigs: null,
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
      apiConfigsCount: Object.keys(this.#cache.apiConfigs || {}).length,
      cacheAge: this.#cache.lastLoadTime ? Date.now() - this.#cache.lastLoadTime : null,
      cacheDuration: this.#cacheDuration,
    };
  }
}

export default DatabaseConfigService;
