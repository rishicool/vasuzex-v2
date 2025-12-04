/**
 * Cache Facade
 */

import { Facade, createFacade } from './Facade.js';

class CacheFacade extends Facade {
  static getFacadeAccessor() {
    return 'cache';
  }
}

export default createFacade(CacheFacade);
