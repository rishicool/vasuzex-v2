/**
 * Log Facade
 */

import { Facade, createFacade } from './Facade.js';

class LogFacade extends Facade {
  static getFacadeAccessor() {
    return 'log';
  }
}

export default createFacade(LogFacade);
