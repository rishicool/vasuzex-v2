/**
 * Media Service Provider
 */

import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { MediaManager } from './MediaManager.js';
import { mkdirSync, existsSync } from 'fs';

export class MediaServiceProvider extends ServiceProvider {
  /**
   * Register the service provider
   */
  register() {
    this.app.singleton('media', (app) => {
      return new MediaManager(app);
    });
  }

  /**
   * Bootstrap the service provider
   */
  boot() {
    // Ensure cache directory exists
    const media = this.app.make('media');
    
    if (!existsSync(media.cacheDir)) {
      mkdirSync(media.cacheDir, { recursive: true });
    }
  }
}

export default MediaServiceProvider;
