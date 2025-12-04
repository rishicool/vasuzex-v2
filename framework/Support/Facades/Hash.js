/**
 * Hash Facade
 */

import { Facade, createFacade } from './Facade.js';

class HashFacade extends Facade {
  static getFacadeAccessor() {
    return 'hash';
  }
}

export default createFacade(HashFacade);
