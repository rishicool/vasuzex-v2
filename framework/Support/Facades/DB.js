/**
 * DB Facade
 */

import { Facade, createFacade } from './Facade.js';

class DBFacade extends Facade {
  static getFacadeAccessor() {
    return 'db';
  }
}

export default createFacade(DBFacade);
