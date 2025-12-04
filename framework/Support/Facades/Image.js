/**
 * Image Facade
 * 
 * Provides static access to Image service.
 * 
 * @example
 * import { Image } from '#framework';
 * 
 * // Resize image
 * await Image.resize('./photo.jpg', {
 *   width: 800,
 *   height: 600
 * });
 * 
 * // Create thumbnail
 * await Image.thumbnail('./photo.jpg', 200, 200);
 * 
 * // Optimize
 * await Image.optimize('./photo.jpg', { quality: 80 });
 */

import { Facade } from './Facade.js';

export class Image extends Facade {
  /**
   * Get the accessor for the facade
   */
  static getFacadeAccessor() {
    return 'image';
  }
}

export default Image;
