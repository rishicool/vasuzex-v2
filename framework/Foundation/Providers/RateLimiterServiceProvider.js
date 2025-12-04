/**
 * RateLimiterServiceProvider
 * Register Rate Limiter service
 */

import { RateLimiter } from '../../Support/RateLimiter.js';

export class RateLimiterServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('rate-limiter', (app) => {
      const cache = app.make('cache');
      return new RateLimiter(cache);
    });

    this.app.alias('rate-limiter', 'RateLimiter');
  }

  boot() {
    // Boot logic if needed
  }
}

export default RateLimiterServiceProvider;
