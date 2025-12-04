/**
 * HTTP Service Provider
 */

export class HttpServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('http', (app) => {
      const { HttpManager } = require('./HttpManager.js');
      return new HttpManager(app);
    });
  }

  boot() {
    // Nothing to bootstrap
  }
}

export default HttpServiceProvider;
