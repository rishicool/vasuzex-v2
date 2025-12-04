/**
 * GeoIP Facade
 */

import { Facade } from './Facade.js';

export class GeoIP extends Facade {
  /**
   * Get the registered name of the component
   */
  static getFacadeAccessor() {
    return 'geoip';
  }
}

export default GeoIP;
