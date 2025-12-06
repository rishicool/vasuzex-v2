/**
 * RateLimiter Tests
 * Tests for rate limiting functionality
 * 
 * Tests Cover:
 * - tooManyAttempts() - checking rate limits
 * - hit() - incrementing attempts
 * - attempts() - getting attempt count
 * - resetAttempts() - clearing attempts
 * - retriesLeft() - calculating remaining attempts
 * - clear() - clearing all rate limit data
 * - availableIn() - calculating retry time
 * - attempt() - executing within rate limit
 * - limiterKey() - key generation
 * - for() - middleware creation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('RateLimiter', () => {
  let RateLimiter;
  let rateLimiter;
  let mockCache;

  beforeEach(async () => {
    const module = await import('../../../framework/Support/RateLimiter.js');
    RateLimiter = module.RateLimiter;

    mockCache = {
      get: jest.fn(),
      put: jest.fn(),
      increment: jest.fn(),
      forget: jest.fn()
    };

    rateLimiter = new RateLimiter(mockCache);
  });

  describe('Constructor', () => {
    it('should initialize with cache instance', () => {
      expect(rateLimiter.cache).toBe(mockCache);
    });
  });

  describe('tooManyAttempts()', () => {
    it('should return true when attempts exceed max', async () => {
      mockCache.get.mockResolvedValue(5);

      const result = await rateLimiter.tooManyAttempts('test-key', 3);

      expect(result).toBe(true);
    });

    it('should return false when attempts under max', async () => {
      mockCache.get.mockResolvedValue(2);

      const result = await rateLimiter.tooManyAttempts('test-key', 3);

      expect(result).toBe(false);
    });

    it('should return false when no attempts', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await rateLimiter.tooManyAttempts('test-key', 3);

      expect(result).toBe(false);
    });
  });

  describe('hit()', () => {
    it('should increment attempts', async () => {
      mockCache.increment.mockResolvedValue(2);

      const result = await rateLimiter.hit('test-key');

      expect(mockCache.increment).toHaveBeenCalledWith('test-key');
      expect(result).toBe(2);
    });

    it('should set expiry on first hit', async () => {
      mockCache.increment.mockResolvedValue(1);

      await rateLimiter.hit('test-key', 5);

      expect(mockCache.put).toHaveBeenCalledWith('test-key', 1, 300); // 5 minutes * 60 seconds
    });

    it('should not set expiry on subsequent hits', async () => {
      mockCache.increment.mockResolvedValue(2);

      await rateLimiter.hit('test-key');

      expect(mockCache.put).not.toHaveBeenCalled();
    });
  });

  describe('attempts()', () => {
    it('should return attempt count', async () => {
      mockCache.get.mockResolvedValue(5);

      const result = await rateLimiter.attempts('test-key');

      expect(result).toBe(5);
    });

    it('should return 0 when no attempts', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await rateLimiter.attempts('test-key');

      expect(result).toBe(0);
    });
  });

  describe('resetAttempts()', () => {
    it('should clear attempts', async () => {
      await rateLimiter.resetAttempts('test-key');

      expect(mockCache.forget).toHaveBeenCalledWith('test-key');
    });
  });

  describe('retriesLeft()', () => {
    it('should calculate retries left', async () => {
      mockCache.get.mockResolvedValue(3);

      const result = await rateLimiter.retriesLeft('test-key', 5);

      expect(result).toBe(2); // 5 - 3 = 2
    });

    it('should return 0 when no retries left', async () => {
      mockCache.get.mockResolvedValue(5);

      const result = await rateLimiter.retriesLeft('test-key', 5);

      expect(result).toBe(0);
    });

    it('should not return negative values', async () => {
      mockCache.get.mockResolvedValue(7);

      const result = await rateLimiter.retriesLeft('test-key', 5);

      expect(result).toBe(0);
    });
  });

  describe('clear()', () => {
    it('should clear attempts and timer', async () => {
      await rateLimiter.clear('test-key');

      expect(mockCache.forget).toHaveBeenCalledWith('test-key');
      expect(mockCache.forget).toHaveBeenCalledWith('test-key:timer');
    });
  });

  describe('availableIn()', () => {
    it('should return seconds until available', async () => {
      const futureTime = Date.now() + 5000;
      mockCache.get.mockResolvedValue(futureTime);

      const result = await rateLimiter.availableIn('test-key');

      expect(result).toBeGreaterThan(4000);
      expect(result).toBeLessThanOrEqual(5000);
    });

    it('should return 0 when no timer set', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await rateLimiter.availableIn('test-key');

      expect(result).toBe(0);
    });

    it('should return 0 when timer expired', async () => {
      const pastTime = Date.now() - 5000;
      mockCache.get.mockResolvedValue(pastTime);

      const result = await rateLimiter.availableIn('test-key');

      expect(result).toBe(0);
    });
  });

  describe('attempt()', () => {
    it('should execute callback within rate limit', async () => {
      mockCache.get.mockResolvedValue(0);
      mockCache.increment.mockResolvedValue(1);
      
      const callback = jest.fn().mockResolvedValue('success');

      const result = await rateLimiter.attempt('test-key', 5, callback);

      expect(callback).toHaveBeenCalled();
      expect(result).toBe('success');
      expect(mockCache.increment).toHaveBeenCalledWith('test-key');
    });

    it('should return false when rate limit exceeded', async () => {
      mockCache.get.mockResolvedValue(5);
      
      const callback = jest.fn();

      const result = await rateLimiter.attempt('test-key', 3, callback);

      expect(callback).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('limiterKey()', () => {
    it('should generate rate limiter key', () => {
      const key = rateLimiter.limiterKey('api', 'user-123');

      expect(key).toBe('rate_limit:api:user-123');
    });

    it('should handle different identifiers', () => {
      expect(rateLimiter.limiterKey('login', 'ip-192.168.1.1')).toBe('rate_limit:login:ip-192.168.1.1');
      expect(rateLimiter.limiterKey('download', 'file-456')).toBe('rate_limit:download:file-456');
    });
  });

  describe('for() middleware', () => {
    it('should create middleware function', () => {
      const middleware = rateLimiter.for('api', () => 'test-id');

      expect(typeof middleware).toBe('function');
    });

    it('should allow request within rate limit', async () => {
      mockCache.get.mockResolvedValue(2);
      mockCache.increment.mockResolvedValue(3);

      const callback = jest.fn().mockResolvedValue('user-123');
      const middleware = rateLimiter.for('api', callback);

      const req = {};
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block request when rate limit exceeded', async () => {
      mockCache.get.mockResolvedValue(60);

      const callback = jest.fn().mockResolvedValue('user-123');
      const middleware = rateLimiter.for('api', callback);

      const req = {};
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Too many requests'
      }));
    });

    it('should set rate limit headers', async () => {
      mockCache.get.mockResolvedValue(10);
      mockCache.increment.mockResolvedValue(11);

      const callback = jest.fn().mockResolvedValue('user-123');
      const middleware = rateLimiter.for('api', callback);

      const req = {};
      const res = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await middleware(req, res, next);

      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(res.set).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    });
  });
});
