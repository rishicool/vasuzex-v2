/**
 * ConfigLoader - Generic configuration loader for ES modules
 * 
 * Provides a reusable way to load CommonJS config files and .env files
 * from any Node.js project (not specific to Neastore).
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
   */
  loadDotenv() {
    const envPath = path.join(this.rootDir, this.envFile);
    
    if (!fs.existsSync(envPath)) {
      console.warn(`⚠️  .env file not found at ${envPath}`);
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;

      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    });

    console.log(`✅ Loaded .env file from ${envPath}`);
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
