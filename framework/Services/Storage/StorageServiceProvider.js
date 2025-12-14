import { ServiceProvider } from '../../Foundation/ServiceProvider.js';
import { StorageManager } from './StorageManager.js';

/**
 * Storage Service Provider
 * 
 * Registers Storage service in the application container.
 * Provides file storage capabilities via multiple drivers (Local, S3, MinIO).
 */
export class StorageServiceProvider extends ServiceProvider {
  /**
   * Register the service
   */
  async register() {
    this.singleton('storage', (app) => {
      return new StorageManager(app);
    });

    // Create aliases
    this.alias('filesystem', 'storage');
    this.alias('Storage', 'storage');
  }

  /**
   * Bootstrap the service
   */
  async boot() {
    // Storage service is ready to use
  }
}

export default StorageServiceProvider;
