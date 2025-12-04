/**
 * BroadcastServiceProvider
 * Register Broadcasting service
 */

import { BroadcastManager } from '../../Broadcasting/BroadcastManager.js';

export class BroadcastServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('broadcast', (app) => {
      return new BroadcastManager(app);
    });

    this.app.alias('broadcast', 'BroadcastManager');
  }

  boot() {
    // Boot logic if needed
  }
}

export default BroadcastServiceProvider;
