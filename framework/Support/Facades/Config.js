/**
 * Config Facade
 * Enhanced to support standalone scripts without Application instance
 */

import { Facade, createFacade } from './Facade.js';
import path from 'path';
import { existsSync, readdirSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

// Create require for loading .cjs files
const require = createRequire(import.meta.url);

let standaloneConfig = null;
let standaloneConfigLoaded = false;

class ConfigFacade extends Facade {
  static getFacadeAccessor() {
    return 'config';
  }

  /**
   * Get config value with standalone fallback
   * Works in both app context and standalone scripts
   */
  static get(key, defaultValue = null) {
    // Try app context first (if Application exists)
    if (this.app) {
      try {
        const instance = this.getFacadeRoot();
        return instance.get(key, defaultValue);
      } catch (error) {
        // Fall through to standalone mode
      }
    }

    // Standalone mode: Load config directly
    return this.getStandalone(key, defaultValue);
  }

  /**
   * Load config in standalone mode (no Application)
   * Discovers project root and loads config files
   */
  static getStandalone(key, defaultValue = null) {
    if (!standaloneConfigLoaded) {
      this.loadStandaloneConfig();
    }

    if (!standaloneConfig) {
      return defaultValue;
    }

    // Navigate nested keys (e.g., 'database.connections.default')
    const keys = key.split('.');
    let value = standaloneConfig;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Load all config files from config/ directory
   */
  static loadStandaloneConfig() {
    try {
      // Find project root (look for config/ directory)
      const rootDir = this.findProjectRoot();
      if (!rootDir) {
        standaloneConfig = {};
        standaloneConfigLoaded = true;
        return;
      }

      const configDir = path.join(rootDir, 'config');
      if (!existsSync(configDir)) {
        standaloneConfig = {};
        standaloneConfigLoaded = true;
        return;
      }

      // Load all .cjs config files
      const files = readdirSync(configDir);
      standaloneConfig = {};

      for (const file of files) {
        if (file.endsWith('.cjs')) {
          const configName = file.replace(/\.cjs$/, '');
          const configPath = path.join(configDir, file);
          
          try {
            // Clear require cache to get fresh config
            const resolvedPath = require.resolve(configPath);
            delete require.cache[resolvedPath];
            
            // Load config file
            const configData = require(configPath);
            standaloneConfig[configName] = configData;
          } catch (error) {
            // Silently skip files that can't be loaded
          }
        }
      }

      standaloneConfigLoaded = true;
    } catch (error) {
      standaloneConfig = {};
      standaloneConfigLoaded = true;
    }
  }

  /**
   * Find project root by looking for config/ directory
   */
  static findProjectRoot() {
    try {
      // Start from current working directory
      let dir = process.cwd();
      
      // Walk up until we find config/
      for (let i = 0; i < 10; i++) {
        const configPath = path.join(dir, 'config');
        if (existsSync(configPath)) {
          return dir;
        }
        
        const parent = path.dirname(dir);
        if (parent === dir) break; // Reached filesystem root
        dir = parent;
      }

      return null;
    } catch (error) {
      return null;
    }
  }
}

export default createFacade(ConfigFacade);
