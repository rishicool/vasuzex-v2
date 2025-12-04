/**
 * LoadEnvironmentVariables Bootstrap
 * 
 * Loads .env file into process.env.
 * Similar to Laravel's LoadEnvironmentVariables bootstrap.
 */

import { ConfigLoader } from '../../Support/ConfigLoader.js';

export class LoadEnvironmentVariables {
  /**
   * Bootstrap the application
   * @param {Application} app - Application instance
   * @param {string} rootDir - Root directory path
   */
  async bootstrap(app, rootDir) {
    const loader = new ConfigLoader({ rootDir });
    loader.loadDotenv();
    
    console.log('✅ Environment variables loaded');
  }
}

export default LoadEnvironmentVariables;
