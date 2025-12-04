/**
 * Storage Facade
 */

import { Facade, createFacade } from './Facade.js';

class StorageFacade extends Facade {
  static getFacadeAccessor() {
    return 'storage';
  }
}

export default createFacade(StorageFacade);
