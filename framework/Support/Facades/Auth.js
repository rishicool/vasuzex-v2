/**
 * Auth Facade
 */

import { Facade, createFacade } from './Facade.js';

class AuthFacade extends Facade {
  static getFacadeAccessor() {
    return 'auth';
  }
}

export default createFacade(AuthFacade);
