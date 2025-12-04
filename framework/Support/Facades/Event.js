/**
 * Event Facade
 */

import { Facade, createFacade } from './Facade.js';

class EventFacade extends Facade {
  static getFacadeAccessor() {
    return 'events';
  }
}

export default createFacade(EventFacade);
