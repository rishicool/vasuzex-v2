/**
 * Upload Service Provider
 * 
 * Registers Upload service in the application container.
 */

export class UploadServiceProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Register the service
   */
  register() {
    this.app.singleton('upload', (app) => {
      const { UploadManager } = require('./UploadManager.js');
      return new UploadManager(app);
    });
  }

  /**
   * Bootstrap the service
   */
  boot() {
    // Nothing to bootstrap
  }
}

export default UploadServiceProvider;
