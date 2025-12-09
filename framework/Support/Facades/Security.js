/**
 * Security Facade
 * Static accessor for SecurityService
 */

import { Facade } from './Facade.js';

class SecurityFacade extends Facade {
  static getFacadeAccessor() {
    return 'security';
  }
}

export default SecurityFacade;
