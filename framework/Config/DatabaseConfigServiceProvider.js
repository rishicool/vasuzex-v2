/**
 * DatabaseConfigServiceProvider
 * Service provider for database-driven configuration
 * 
 * UNIFIED: Loads configurations from app_configs table ONLY
 * (system_configs has been merged into app_configs with scope column)
 * 
 * - scope='api' configs are loaded into Config facade for backend use
 * - scope='app' configs stay in DB for frontend API endpoints
 * 
 * @example
 * // In app.js
 * import { DatabaseConfigServiceProvider } from '#framework/Config/DatabaseConfigServiceProvider.js';
 * 
 * const providers = [
 *   DatabaseConfigServiceProvider,
 *   // ... other providers
 * ];
 */

import { ServiceProvider } from '../Foundation/ServiceProvider.js';
import { DatabaseConfigService } from './DatabaseConfigService.js';

export class DatabaseConfigServiceProvider extends ServiceProvider {
  /**
   * Register services in the container
   */
  register() {
    // Register DatabaseConfigService as singleton
    this.singleton('db.config', (app) => {
      const environment = process.env.NODE_ENV || 'development';
      
      return new DatabaseConfigService(app, {
        environment,
        cacheDuration: 5 * 60 * 1000, // 5 minutes
      });
    });

    // Create alias for convenience
    this.alias('database.config', 'db.config');
  }

  /**
   * Bootstrap services
   * Load database configs (scope='api') and merge into ConfigRepository
   */
  async boot() {
    try {
      const dbConfigService = this.make('db.config');
      
      // Load API-scoped configs from unified app_configs table
      await dbConfigService.load();
      
      console.log('[DatabaseConfigServiceProvider] Database configs loaded (unified app_configs table)');
      
      // Log cache stats in debug mode
      if (this.config('app.debug', false)) {
        const stats = dbConfigService.getCacheStats();
        console.log('[DatabaseConfigServiceProvider] Cache stats:', {
          apiConfigs: stats.apiConfigsCount,
          cacheValid: stats.isValid,
        });
      }
    } catch (error) {
      console.error('[DatabaseConfigServiceProvider] Failed to load database configs:', error.message);
      // Don't throw - app should continue with file-based configs
    }
  }
}

export default DatabaseConfigServiceProvider;
