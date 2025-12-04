/**
 * Location Facade
 * 
 * Laravel-style static accessor for Location service
 * 
 * @example
 * import { Location } from '#framework/Support/Facades';
 * 
 * const distance = Location.calculateDistance(lat1, lon1, lat2, lon2);
 * const nearby = await Location.findNearbyPlaces(lat, lon, 'restaurant', 1000);
 */

import { Facade } from './Facade.js';

class LocationFacade extends Facade {
  static getFacadeAccessor() {
    return 'location';
  }
}

export default LocationFacade;
