/**
 * Queue Facade
 */

import { Facade, createFacade } from './Facade.js';

class QueueFacade extends Facade {
  static getFacadeAccessor() {
    return 'queue';
  }
}

export default createFacade(QueueFacade);
