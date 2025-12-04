/**
 * Mail Facade
 */

import { Facade, createFacade } from './Facade.js';

class MailFacade extends Facade {
  static getFacadeAccessor() {
    return 'mail';
  }
}

export default createFacade(MailFacade);
