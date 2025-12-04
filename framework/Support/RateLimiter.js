/**
 * Rate Limiter
 * Laravel-inspired rate limiting
 */

export class RateLimiter {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * Determine if the given key has been "accessed" too many times
   */
  async tooManyAttempts(key, maxAttempts) {
    const attempts = await this.attempts(key);
    return attempts >= maxAttempts;
  }

  /**
   * Increment the counter for a given key
   */
  async hit(key, decayMinutes = 1) {
    const attempts = await this.cache.increment(key);

    if (attempts === 1) {
      await this.cache.put(key, 1, decayMinutes * 60);
    }

    return attempts;
  }

  /**
   * Get the number of attempts for the given key
   */
  async attempts(key) {
    return (await this.cache.get(key)) || 0;
  }

  /**
   * Reset the number of attempts for the given key
   */
  async resetAttempts(key) {
    return await this.cache.forget(key);
  }

  /**
   * Get the number of retries left for the given key
   */
  async retriesLeft(key, maxAttempts) {
    const attempts = await this.attempts(key);
    return Math.max(0, maxAttempts - attempts);
  }

  /**
   * Clear the hits and lockout for the given key
   */
  async clear(key) {
    await this.resetAttempts(key);
    await this.cache.forget(`${key}:timer`);
  }

  /**
   * Get the number of seconds until the "key" is accessible again
   */
  async availableIn(key) {
    const timer = await this.cache.get(`${key}:timer`);
    if (!timer) {
      return 0;
    }

    return Math.max(0, timer - Date.now());
  }

  /**
   * Attempt to execute callback within rate limit
   */
  async attempt(key, maxAttempts, callback, decayMinutes = 1) {
    if (await this.tooManyAttempts(key, maxAttempts)) {
      return false;
    }

    const result = await callback();

    await this.hit(key, decayMinutes);

    return result;
  }

  /**
   * Create a rate limit key for a given identifier
   */
  limiterKey(name, identifier) {
    return `rate_limit:${name}:${identifier}`;
  }

  /**
   * Rate limit middleware helper
   */
  for(name, callback) {
    return async (req, res, next) => {
      const key = await callback(req);
      const limiterKey = this.limiterKey(name, key);

      const maxAttempts = 60;
      const decayMinutes = 1;

      if (await this.tooManyAttempts(limiterKey, maxAttempts)) {
        const retryAfter = Math.ceil(await this.availableIn(limiterKey) / 1000);
        
        res.set('X-RateLimit-Limit', maxAttempts);
        res.set('X-RateLimit-Remaining', 0);
        res.set('Retry-After', retryAfter);

        return res.status(429).json({
          success: false,
          message: 'Too many requests',
          retry_after: retryAfter
        });
      }

      await this.hit(limiterKey, decayMinutes);

      const remaining = await this.retriesLeft(limiterKey, maxAttempts);
      res.set('X-RateLimit-Limit', maxAttempts);
      res.set('X-RateLimit-Remaining', remaining);

      next();
    };
  }
}

export default RateLimiter;
