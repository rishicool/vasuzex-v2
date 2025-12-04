/**
 * Upload Facade
 * 
 * Provides static access to Upload service.
 * 
 * @example
 * import { Upload } from '#framework';
 * 
 * // Upload file
 * const result = await Upload.upload(file, {
 *   disk: 'local',
 *   path: 'uploads/images'
 * });
 * 
 * // Get URL
 * const url = Upload.url('uploads/image.jpg');
 * 
 * // Delete file
 * await Upload.delete('uploads/image.jpg');
 */

import { Facade } from './Facade.js';

export class Upload extends Facade {
  /**
   * Get the accessor for the facade
   */
  static getFacadeAccessor() {
    return 'upload';
  }
}

export default Upload;
