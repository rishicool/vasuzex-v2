/**
 * Validator Facade
 */

import { Facade, createFacade } from './Facade.js';

class ValidatorFacade extends Facade {
  static getFacadeAccessor() {
    return 'validator';
  }
}

export default createFacade(ValidatorFacade);
