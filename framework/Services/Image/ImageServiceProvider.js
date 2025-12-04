/**
 * Image Service Provider
 * 
 * Registers Image service in the application container.
 */

export class ImageServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service
   */
  register() {
    this.app.singleton('image', (app) => {
      const { ImageManager } = require('./ImageManager.js');
      return new ImageManager(app);
    });
  }

  /**
   * Bootstrap the service
   */
  boot() {
    // Nothing to bootstrap
  }
}

export default ImageServiceProvider;
