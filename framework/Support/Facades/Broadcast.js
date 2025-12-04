/**
 * Broadcast Facade
 */

import { Facade, createFacade } from './Facade.js';

class BroadcastFacade extends Facade {
  static getFacadeAccessor() {
    return 'broadcast';
  }
}

export default createFacade(BroadcastFacade);
