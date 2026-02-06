/**
 * ConfigLoader - Generic configuration loader for ES modules
 * 
 * Provides a reusable way to load CommonJS config files and .env files
 * from any Node.js project (not specific to neasto).
 * 
 * @example
 * // In your app
 * import { ConfigLoader } from 'vasuzex-framework';
 * 
 * const loader = new ConfigLoader({
 *   rootDir: '/path/to/project',
 *   configDir: 'config',
 *   envFile: '.env'
 * });
 * 
 * const config = loader.loadConfig();
 * console.log(config.DATABASE_HOST);
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

export class ConfigLoader {
  constructor(options = {}) {
    this.rootDir = options.rootDir;
    this.configDir = options.configDir || 'config';
    this.envFile = options.envFile || '.env';
    this.environment = options.environment || process.env.NODE_ENV || process.env.APP_ENV || 'local';
    this.require = createRequire(import.meta.url);
    this.config = null;
  }

  /**
   * Load .env file manually (simple dotenv replacement)
   * Now supports environment-specific files:
   * - .env (base)
   * - .env.local (local overrides, gitignored)
   * - .env.{environment} (environment-specific)
   * - .env.{environment}.local (environment + local overrides)
   * 
   * Load order (later files override earlier):
   * 1. .env
   * 2. .env.local
   * 3. .env.{environment}
   * 4. .env.{environment}.local
   */
  loadDotenv() {
    const environment = this.environment;
    
    // Define load order (later files override earlier)
    const envFiles = [
      '.env',                           // Base environment
      '.env.local',                     // Local overrides (gitignored)
      `.env.${environment}`,            // Environment-specific
      `.env.${environment}.local`,      // Environment + local
    ];

    let loadedCount = 0;
    
    for (const envFile of envFiles) {
      const loaded = this.#loadDotenvFile(envFile);
      if (loaded) loadedCount++;
    }

    if (loadedCount === 0) {
      // Only warn if no environment variables are loaded at all
      if (!process.env.APP_NAME && !process.env.DB_CONNECTION) {
        console.warn(`⚠️  No .env files found in ${this.rootDir}`);
      }
    } else {
      console.log(`✅ Loaded ${loadedCount} .env file(s)`);
    }
  }

  /**
   * Load a specific .env file
   * @private
   */
  #loadDotenvFile(filename) {
    const envPath = path.join(this.rootDir, filename);
    
    if (!fs.existsSync(envPath)) {
      return false;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) return;

      const key = line.substring(0, equalIndex).trim();
      let value = line.substring(equalIndex + 1).trim();

      // Strip quotes (single or double)
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }

      // Allow override (later files win)
      process.env[key] = value;
    });

    return true;
  }

  /**
   * Load configuration based on environment
   */
  loadConfig() {
    // Load .env first if not already loaded
    if (!this.config) {
      this.loadDotenv();
    }

    const env = this.environment;

    try {
      const configPath = path.join(this.rootDir, this.configDir, `${env}.cjs`);
      this.config = this.require(configPath);
      console.log(`✅ Loaded configuration: ${env}`);

      // Set config values to process.env for backwards compatibility
      Object.keys(this.config).forEach(key => {
        if (process.env[key] === undefined) {
          process.env[key] = String(this.config[key]);
        }
      });

      return this.config;
    } catch (error) {
      console.warn(`⚠️  Config file not found for "${env}", falling back to local`);
      
      try {
        const configPath = path.join(this.rootDir, this.configDir, 'local.cjs');
        this.config = this.require(configPath);

        // Set config values to process.env
        Object.keys(this.config).forEach(key => {
          if (process.env[key] === undefined) {
            process.env[key] = String(this.config[key]);
          }
        });

        return this.config;
      } catch (fallbackError) {
        throw new Error(`Failed to load config: ${fallbackError.message}`);
      }
    }
  }

  /**
   * Get specific config value
   */
  get(key, fallback = undefined) {
    if (!this.config) {
      this.loadConfig();
    }

    return this.config[key] !== undefined ? this.config[key] : fallback;
  }

  /**
   * Get all config values
   */
  getAll() {
    if (!this.config) {
      this.loadConfig();
    }

    return { ...this.config };
  }

  /**
   * Reload configuration
   */
  reload() {
    // Clear require cache for config files
    const env = this.environment;
    const configPath = path.join(this.rootDir, this.configDir, `${env}.cjs`);
    delete this.require.cache[this.require.resolve(configPath)];
    
    this.config = null;
    return this.loadConfig();
  }
}

/**
 * Helper function to create config loader from current file
 * Automatically calculates root directory based on levels up
 * 
 * @param {string} currentFileUrl - import.meta.url from calling file
 * @param {number} levelsUp - Number of directories to go up to reach project root
 * @param {object} options - Additional options
 */
export function createConfigLoader(currentFileUrl, levelsUp = 4, options = {}) {
  const currentFilePath = new URL(currentFileUrl).pathname;
  const currentDir = path.dirname(currentFilePath);
  const rootDir = path.resolve(currentDir, '../'.repeat(levelsUp));

  return new ConfigLoader({
    rootDir,
    ...options
  });
}

export default ConfigLoader;
