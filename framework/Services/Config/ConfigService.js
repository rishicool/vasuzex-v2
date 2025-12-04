/**
 * ConfigService - Unified database-driven configuration
 * Laravel-inspired config service for monorepo
 * 
 * @example
 * // In app initialization
 * import { ConfigService } from 'vasuzex';
 * import { getDatabase } from 'vasuzex/Database';
 * 
 * const DB = await getDatabase();
 * const appConfig = new ConfigService({ table: 'app_configs', env: 'production' });
 * await appConfig.init(DB);
 * 
 * const googleKey = appConfig.get('integrations.googleMapsKey');
 * const storage = appConfig.get('storage.driver', 'local'); // with fallback
 */

export class ConfigService {
  constructor(options = {}) {
    this.tableName = options.table || 'app_configs';
    this.environment = options.env || process.env.NODE_ENV || 'development';
    this.configCache = {};
    this.isInitialized = false;
    this.lastLoadTime = null;
    this.cacheDuration = options.cacheDuration || 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize config service with database connection
   * @param {Object} DB - GuruORM database instance
   */
  async init(DB) {
    if (this.isInitialized) return;
    
    this.DB = DB;
    await this._loadConfigs();
  }

  /**
   * Load configs from database
   * @private
   */
  async _loadConfigs() {
    try {
      console.log(`📦 Loading configs from ${this.tableName} (env: ${this.environment})`);

      // Generic query - works with any config table
      const configs = await this.DB.table(this.tableName)
        .where('is_active', true)
        .where(function(query) {
          query.where('environment', this.environment)
            .orWhere('environment', 'all');
        }.bind(this))
        .get();

      // Build nested object from dot-notation keys
      this.configCache = this._buildNestedObject(configs);
      this.lastLoadTime = Date.now();
      this.isInitialized = true;

      console.log(`✅ Loaded ${configs.length} configs from ${this.tableName}`);
    } catch (error) {
      console.error(`❌ Failed to load configs from ${this.tableName}:`, error.message);
      throw error;
    }
  }

  /**
   * Get config value with dot notation
   * @param {string} key - Dot notation key (e.g., 'storage.driver')
   * @param {any} fallback - Fallback value if not found
   */
  get(key, fallback = null) {
    // Auto-reload if cache expired
    if (this.shouldReload()) {
      this._loadConfigs().catch(err => {
        console.warn(`⚠️ Auto-reload failed for ${this.tableName}:`, err.message);
      });
    }

    return this._getNestedValue(this.configCache, key) ?? fallback;
  }

  /**
   * Get all configs
   */
  getAll() {
    return { ...this.configCache };
  }

  /**
   * Force reload configs
   */
  async reload() {
    this.isInitialized = false;
    await this._loadConfigs();
  }

  /**
   * Check if should reload
   * @private
   */
  shouldReload() {
    return this.lastLoadTime && (Date.now() - this.lastLoadTime) > this.cacheDuration;
  }

  /**
   * Build nested object from flat key-value pairs
   * @private
   */
  _buildNestedObject(configs) {
    const result = {};
    
    configs.forEach(item => {
      const keys = item.key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Parse value based on type
      let value = item.value;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(value) && value !== '') value = Number(value);

      current[keys[keys.length - 1]] = value;
    });

    return result;
  }

  /**
   * Get nested value using dot notation
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Clear cache (for testing)
   */
  clear() {
    this.configCache = {};
    this.isInitialized = false;
    this.lastLoadTime = null;
  }
}

export default ConfigService;
