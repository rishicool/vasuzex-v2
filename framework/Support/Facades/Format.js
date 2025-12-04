/**
 * Format Facade
 */

import { Facade } from './Facade.js';

export class Format extends Facade {
  /**
   * Get the registered name of the component
   */
  static getFacadeAccessor() {
    return 'formatter';
  }
}

export default Format;
