/**
 * Media Service Provider
 */

import { ServiceProvider } from '#framework/Foundation/ServiceProvider.js';
import { MediaManager } from './MediaManager.js';
import { mkdirSync, existsSync } from 'fs';

export class MediaServiceProvider extends ServiceProvider {
  /**
   * Register the service provider
   */
  register() {
    this.singleton('media', (app) => {
      return new MediaManager(app);
    });
  }

  /**
   * Bootstrap the service provider
   */
  boot() {
    // Ensure cache directory exists
    const media = this.make('media');
    
    if (!existsSync(media.cacheDir)) {
      mkdirSync(media.cacheDir, { recursive: true });
    }
  }
}

export default MediaServiceProvider;
