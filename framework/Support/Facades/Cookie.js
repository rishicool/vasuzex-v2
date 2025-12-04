/**
 * Cookie Facade
 */

import { Facade, createFacade } from './Facade.js';

class CookieFacade extends Facade {
  static getFacadeAccessor() {
    return 'cookie';
  }
}

export default createFacade(CookieFacade);
