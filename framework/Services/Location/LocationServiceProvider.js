/**
 * LocationServiceProvider
 * 
 * Registers location service and query builder extensions
 */

export default class LocationServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register location service
   */
  register() {
    this.app.singleton('location', (app) => {
      const { default: LocationManager } = require('./LocationManager.js');
      const config = app.make('config').get('location', {});
      
      const manager = new LocationManager(config);

      // Setup geocoding provider if configured
      if (config.geocoding?.provider === 'google' && config.geocoding?.api_key) {
        const { GoogleGeocodingProvider } = require('./Providers/index.js');
        const provider = new GoogleGeocodingProvider(
          config.geocoding.api_key,
          config.geocoding.options || {}
        );
        manager.setGeocodingProvider(provider);
      }

      return manager;
    });
  }

  /**
   * Bootstrap location service
   */
  async boot() {
    // Install query builder methods into GuruORM
    try {
      const { installLocationMethods } = require('./LocationQueryBuilder.js');
      
      // Try to get GuruORM QueryBuilder
      const db = this.app.make('db');
      if (db && db.QueryBuilder) {
        installLocationMethods(db.QueryBuilder);
        console.log('✅ Location query methods installed into GuruORM');
      }
    } catch (error) {
      // GuruORM not available, skip query builder installation
      console.warn('⚠️  GuruORM not found, location query methods not installed');
    }
  }
}
