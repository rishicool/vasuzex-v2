/**
 * RateLimiter Facade
 */

import { Facade, createFacade } from './Facade.js';

class RateLimiterFacade extends Facade {
  static getFacadeAccessor() {
    return 'rateLimiter';
  }
}

export default createFacade(RateLimiterFacade);
