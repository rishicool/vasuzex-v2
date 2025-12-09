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
    if (this.config('filesystems.default')) {
      const storage = this.make('storage');
      console.log(`[StorageServiceProvider] Storage service initialized with driver: ${this.config('filesystems.default')}`);
    }
  }
}

export default StorageServiceProvider;
