/**
 * LoadConfiguration Bootstrap
 * 
 * Loads all configuration files from /config directory into ConfigRepository.
 * Similar to Laravel's LoadConfiguration bootstrap.
 */

import { ConfigRepository } from '../../Config/Repository.js';
import { ConfigLoader } from '../../Support/ConfigLoader.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export class LoadConfiguration {
  /**
   * Bootstrap the application
   * @param {Application} app - Application instance
   * @param {string} rootDir - Root directory path
   */
  async bootstrap(app, rootDir) {
    const configPath = path.join(rootDir, 'config');
    
    // Load all config files
    const configFiles = this.getConfigurationFiles(configPath);
    const items = {};

    for (const [key, filePath] of Object.entries(configFiles)) {
      try {
        // Use ConfigLoader's require to load CJS files
        const loader = new ConfigLoader({ rootDir });
        const configData = loader.require(filePath);
        items[key] = configData;
      } catch (error) {
        console.warn(`⚠️  Failed to load config file ${key}:`, error.message);
      }
    }

    // Create and bind ConfigRepository
    const config = new ConfigRepository(items);
    app.instance('config', config);

    console.log(`✅ Loaded ${Object.keys(configFiles).length} configuration files`);
    
    return config;
  }

  /**
   * Get all configuration files
   * @private
   */
  getConfigurationFiles(configPath) {
    const files = {};

    if (!fs.existsSync(configPath)) {
      console.warn(`⚠️  Config directory not found: ${configPath}`);
      return files;
    }

    const entries = fs.readdirSync(configPath);

    for (const file of entries) {
      if (file.endsWith('.cjs') || file.endsWith('.js')) {
        const key = path.basename(file, path.extname(file));
        files[key] = path.join(configPath, file);
      }
    }

    return files;
  }
}

export default LoadConfiguration;
