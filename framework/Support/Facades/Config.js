/**
 * Config Facade
 */

import { Facade, createFacade } from './Facade.js';

class ConfigFacade extends Facade {
  static getFacadeAccessor() {
    return 'config';
  }
}

export default createFacade(ConfigFacade);
