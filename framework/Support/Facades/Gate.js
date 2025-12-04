/**
 * Gate Facade
 */

import { Facade, createFacade } from './Facade.js';

class GateFacade extends Facade {
  static getFacadeAccessor() {
    return 'gate';
  }
}

export default createFacade(GateFacade);
