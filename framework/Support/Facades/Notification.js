/**
 * Notification Facade
 */

import { Facade, createFacade } from './Facade.js';

class NotificationFacade extends Facade {
  static getFacadeAccessor() {
    return 'notification';
  }
}

export default createFacade(NotificationFacade);
