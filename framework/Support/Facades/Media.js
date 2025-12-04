/**
 * Media Facade
 */

import { Facade } from './Facade.js';

export class Media extends Facade {
  /**
   * Get the registered name of the component
   */
  static getFacadeAccessor() {
    return 'media';
  }
}

export default Media;
