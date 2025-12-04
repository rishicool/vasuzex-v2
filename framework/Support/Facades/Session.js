/**
 * Session Facade
 */

import { Facade, createFacade } from './Facade.js';

class SessionFacade extends Facade {
  static getFacadeAccessor() {
    return 'session';
  }
}

export default createFacade(SessionFacade);
