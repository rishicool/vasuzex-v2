/**
 * GeoIP Service Provider
 */

import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { GeoIPManager } from './GeoIPManager.js';

export class GeoIPServiceProvider extends ServiceProvider {
  /**
   * Register the service provider
   */
  register() {
    this.app.singleton('geoip', (app) => {
      return new GeoIPManager(app);
    });
  }

  /**
   * Bootstrap the service provider
   */
  async boot() {
    // Initialize GeoIP database on boot
    const geoip = this.app.make('geoip');
    
    try {
      await geoip.init();
    } catch (error) {
      console.warn('⚠️  GeoIP database not found. Download GeoLite2-City.mmdb to enable geolocation.');
    }
  }
}

export default GeoIPServiceProvider;
