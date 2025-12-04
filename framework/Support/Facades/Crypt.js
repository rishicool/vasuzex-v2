/**
 * Crypt Facade
 */

import { Facade, createFacade } from './Facade.js';

class CryptFacade extends Facade {
  static getFacadeAccessor() {
    return 'encrypter';
  }
}

export default createFacade(CryptFacade);
