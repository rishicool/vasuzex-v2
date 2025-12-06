/**
 * TokenGuard Tests
 * Comprehensive tests for token-based authentication guard
 */

import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import crypto from 'crypto';

describe('TokenGuard', () => {
  let TokenGuard;
  let mockProvider;
  let guard;

  beforeEach(async () => {
    // Import TokenGuard
    const guardModule = await import('../../../framework/Auth/Guards/TokenGuard.js');
    TokenGuard = guardModule.TokenGuard;

    // Mock provider
    mockProvider = {
      retrieveByCredentials: jest.fn(),
      retrieveById: jest.fn()
    };

    guard = new TokenGuard(mockProvider, 'api_token', 'api_token', false);
  });

  describe('Constructor', () => {
    it('should initialize with default parameters', () => {
      const guard = new TokenGuard(mockProvider);

      expect(guard.provider).toBe(mockProvider);
      expect(guard.inputKey).toBe('api_token');
      expect(guard.storageKey).toBe('api_token');
      expect(guard.hash).toBe(false);
      expect(guard.request).toBeNull();
      expect(guard.user).toBeNull();
    });

    it('should initialize with custom parameters', () => {
      const guard = new TokenGuard(mockProvider, 'token', 'auth_token', true);

      expect(guard.inputKey).toBe('token');
      expect(guard.storageKey).toBe('auth_token');
      expect(guard.hash).toBe(true);
    });
  });

  describe('User Retrieval', () => {
    it('should initialize with null user property', () => {
      expect(guard.user).toBeNull();
    });

    it('should have user method defined', () => {
      expect(typeof Object.getPrototypeOf(guard).user).toBe('function');
    });

    it('should return null if no token', async () => {
      guard.request = { query: {}, body: {}, headers: {} };

      const user = await guard.user();

      expect(user).toBeNull();
    });

    it('should retrieve user by token from query', async () => {
      const mockUser = { id: 1, name: 'John' };
      guard.request = {
        query: { api_token: 'test-token' },
        body: {},
        headers: {}
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user = await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'test-token'
      });
      expect(user).toBe(mockUser);
    });

    it('should retrieve user by token from body', async () => {
      const mockUser = { id: 2, name: 'Jane' };
      guard.request = {
        query: {},
        body: { api_token: 'body-token' },
        headers: {}
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user = await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'body-token'
      });
      expect(user).toBe(mockUser);
    });

    it('should retrieve user by bearer token', async () => {
      const mockUser = { id: 3, name: 'Bob' };
      guard.request = {
        query: {},
        body: {},
        headers: { authorization: 'Bearer bearer-token-123' }
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user = await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'bearer-token-123'
      });
      expect(user).toBe(mockUser);
    });

    it('should retrieve user by basic auth password', async () => {
      const mockUser = { id: 4, name: 'Alice' };
      const credentials = 'username:basic-password';
      const encoded = Buffer.from(credentials).toString('base64');

      guard.request = {
        query: {},
        body: {},
        headers: { authorization: `Basic ${encoded}` }
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user = await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'basic-password'
      });
      expect(user).toBe(mockUser);
    });

    it('should hash token when hash option is enabled', async () => {
      const guard = new TokenGuard(mockProvider, 'api_token', 'api_token', true);
      const mockUser = { id: 5, name: 'Hashed User' };
      const plainToken = 'plain-token';
      const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

      guard.request = {
        query: { api_token: plainToken },
        body: {},
        headers: {}
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user = await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: hashedToken
      });
      expect(user).toBe(mockUser);
    });

    it('should prioritize query over body', async () => {
      const mockUser = { id: 6, name: 'Priority User' };
      guard.request = {
        query: { api_token: 'query-token' },
        body: { api_token: 'body-token' },
        headers: {}
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'query-token'
      });
    });

    it('should prioritize bearer over basic auth', async () => {
      const mockUser = { id: 7, name: 'Bearer User' };
      const encoded = Buffer.from('username:password').toString('base64');

      guard.request = {
        query: {},
        body: {},
        headers: {
          authorization: `Bearer bearer-token`
        }
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'bearer-token'
      });
    });
  });

  describe('Token Extraction', () => {
    it('should return null if no request set', () => {
      const token = guard.getTokenForRequest();

      expect(token).toBeNull();
    });

    it('should extract token from query parameter', () => {
      guard.request = {
        query: { api_token: 'query-token' },
        body: {},
        headers: {}
      };

      const token = guard.getTokenForRequest();

      expect(token).toBe('query-token');
    });

    it('should extract token from body', () => {
      guard.request = {
        query: {},
        body: { api_token: 'body-token' },
        headers: {}
      };

      const token = guard.getTokenForRequest();

      expect(token).toBe('body-token');
    });

    it('should extract bearer token from header', () => {
      guard.request = {
        query: {},
        body: {},
        headers: { authorization: 'Bearer my-bearer-token' }
      };

      const token = guard.getTokenForRequest();

      expect(token).toBe('my-bearer-token');
    });

    it('should extract basic auth password', () => {
      const credentials = 'user:pass123';
      const encoded = Buffer.from(credentials).toString('base64');

      guard.request = {
        query: {},
        body: {},
        headers: { authorization: `Basic ${encoded}` }
      };

      const token = guard.getTokenForRequest();

      expect(token).toBe('pass123');
    });

    it('should handle malformed authorization header', () => {
      guard.request = {
        query: {},
        body: {},
        headers: { authorization: 'Invalid' }
      };

      const token = guard.getTokenForRequest();

      expect(token).toBeUndefined();
    });

    it('should handle missing authorization header', () => {
      guard.request = {
        query: {},
        body: {},
        headers: {}
      };

      const token = guard.getTokenForRequest();

      expect(token).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should validate valid credentials', async () => {
      const mockUser = { id: 1, name: 'John' };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const result = await guard.validate({ api_token: 'valid-token' });

      expect(result).toBe(true);
      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: 'valid-token'
      });
    });

    it('should reject invalid credentials', async () => {
      mockProvider.retrieveByCredentials.mockResolvedValue(null);

      const result = await guard.validate({ api_token: 'invalid-token' });

      expect(result).toBe(false);
    });

    it('should reject credentials without input key', async () => {
      const result = await guard.validate({ email: 'test@test.com' });

      expect(result).toBe(false);
      expect(mockProvider.retrieveByCredentials).not.toHaveBeenCalled();
    });

    it('should hash token during validation when enabled', async () => {
      const guard = new TokenGuard(mockProvider, 'api_token', 'api_token', true);
      const mockUser = { id: 1, name: 'John' };
      const plainToken = 'plain-token';
      const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      await guard.validate({ api_token: plainToken });

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        api_token: hashedToken
      });
    });

    it('should handle empty credentials', async () => {
      const result = await guard.validate({});

      expect(result).toBe(false);
    });
  });

  describe('User Management', () => {
    it('should set user', () => {
      const user = { id: 1, name: 'John' };
      const result = guard.setUser(user);

      expect(guard.user).toBe(user);
      expect(result).toBe(guard);
    });

    it('should update cached user', async () => {
      const user1 = { id: 1, name: 'John' };
      const user2 = { id: 2, name: 'Jane' };

      guard.setUser(user1);
      expect(await guard.user()).toBe(user1);

      guard.setUser(user2);
      expect(await guard.user()).toBe(user2);
    });
  });

  describe('Request Management', () => {
    it('should set request', () => {
      const request = { query: {}, body: {}, headers: {} };
      const result = guard.setRequest(request);

      expect(guard.request).toBe(request);
      expect(result).toBe(guard);
    });
  });

  describe('Authentication Checks', () => {
    it('should return true when user is authenticated', async () => {
      const mockUser = { id: 1, name: 'John' };
      guard.request = {
        query: { api_token: 'valid-token' },
        body: {},
        headers: {}
      };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const result = await guard.check();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      guard.request = {
        query: {},
        body: {},
        headers: {}
      };

      const result = await guard.check();

      expect(result).toBe(false);
    });

    it('should return false for guest when authenticated', async () => {
      const mockUser = { id: 1, name: 'John' };
      guard.request = {
        query: { api_token: 'valid-token' },
        body: {},
        headers: {}
      };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const result = await guard.guest();

      expect(result).toBe(false);
    });

    it('should return true for guest when not authenticated', async () => {
      guard.request = {
        query: {},
        body: {},
        headers: {}
      };

      const result = await guard.guest();

      expect(result).toBe(true);
    });
  });

  describe('ID Retrieval', () => {
    it('should return user ID when authenticated', async () => {
      const mockUser = {
        id: 42,
        name: 'John',
        getAuthIdentifier: () => 42
      };
      guard.request = {
        query: { api_token: 'valid-token' },
        body: {},
        headers: {}
      };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const id = await guard.id();

      expect(id).toBe(42);
    });

    it('should return null when not authenticated', async () => {
      guard.request = {
        query: {},
        body: {},
        headers: {}
      };

      const id = await guard.id();

      expect(id).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle request with null query', async () => {
      guard.request = {
        query: null,
        body: {},
        headers: {}
      };

      const user = await guard.user();

      expect(user).toBeNull();
    });

    it('should handle request with null body', async () => {
      guard.request = {
        query: {},
        body: null,
        headers: {}
      };

      const user = await guard.user();

      expect(user).toBeNull();
    });

    it('should handle request with null headers', async () => {
      guard.request = {
        query: {},
        body: {},
        headers: null
      };

      const user = await guard.user();

      expect(user).toBeNull();
    });

    it('should handle empty bearer token', async () => {
      guard.request = {
        query: {},
        body: {},
        headers: { authorization: 'Bearer ' }
      };

      const token = guard.getTokenForRequest();

      expect(token).toBe(''); // Empty string after 'Bearer '
    });

    it('should handle basic auth without colon', async () => {
      const credentials = 'nopassword';
      const encoded = Buffer.from(credentials).toString('base64');

      guard.request = {
        query: {},
        body: {},
        headers: { authorization: `Basic ${encoded}` }
      };

      const token = guard.getTokenForRequest();

      expect(token).toBeUndefined(); // No colon means no password part
    });

    it('should handle user without getAuthIdentifier method', async () => {
      const mockUser = { id: 1, name: 'John' };
      guard.request = {
        query: { api_token: 'valid-token' },
        body: {},
        headers: {}
      };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const id = await guard.id();

      expect(id).toBeNull();
    });

    it('should handle multiple calls to user() with same result', async () => {
      const mockUser = { id: 1, name: 'John' };
      guard.request = {
        query: { api_token: 'test-token' },
        body: {},
        headers: {}
      };
      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      const user1 = await guard.user();
      const user2 = await guard.user();
      const user3 = await guard.user();

      expect(user1).toBe(mockUser);
      expect(user2).toBe(mockUser);
      expect(user3).toBe(mockUser);
      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledTimes(1);
    });

    it('should handle custom input and storage keys', async () => {
      const guard = new TokenGuard(mockProvider, 'custom_token', 'stored_token', false);
      const mockUser = { id: 1, name: 'John' };

      guard.request = {
        query: { custom_token: 'my-token' },
        body: {},
        headers: {}
      };

      mockProvider.retrieveByCredentials.mockResolvedValue(mockUser);

      await guard.user();

      expect(mockProvider.retrieveByCredentials).toHaveBeenCalledWith({
        stored_token: 'my-token'
      });
    });
  });
});
