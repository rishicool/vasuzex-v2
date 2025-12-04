/**
 * HTTP Client Service Tests
 * Tests for Laravel-style fluent HTTP client
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import HttpManager from '../framework/Services/Http/HttpManager.js';
import { mockFetch, restoreFetch } from './helpers/utils.js';

describe('HttpManager', () => {
  let http;

  beforeEach(() => {
    http = new HttpManager({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
  });

  afterEach(() => {
    restoreFetch();
  });

  describe('GET Requests', () => {
    test('makes GET request', async () => {
      mockFetch({ data: 'test' });

      const response = await http.get('/users');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({ method: 'GET' })
      );
      expect(await response.json()).toEqual({ data: 'test' });
    });

    test('appends query parameters', async () => {
      mockFetch({ data: 'test' });

      await http.get('/users', { page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });
  });

  describe('POST Requests', () => {
    test('makes POST request with JSON', async () => {
      mockFetch({ success: true });

      const response = await http.post('/users', { name: 'John' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'John' }),
        })
      );
    });

    test('makes POST request with form data', async () => {
      mockFetch({ success: true });

      await http.asForm().post('/upload', { file: 'test.jpg' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('PUT/PATCH/DELETE Requests', () => {
    test('makes PUT request', async () => {
      mockFetch({ success: true });

      await http.put('/users/1', { name: 'Updated' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });

    test('makes PATCH request', async () => {
      mockFetch({ success: true });

      await http.patch('/users/1', { name: 'Patched' });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    test('makes DELETE request', async () => {
      mockFetch({ success: true });

      await http.delete('/users/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Authentication', () => {
    test('adds bearer token', async () => {
      mockFetch({ data: 'test' });

      await http.withToken('secret-token').get('/protected');

      const call = global.fetch.mock.calls[0];
      expect(call[1].headers.Authorization).toBe('Bearer secret-token');
    });

    test('adds basic auth', async () => {
      mockFetch({ data: 'test' });

      await http.withBasicAuth('user', 'pass').get('/protected');

      const call = global.fetch.mock.calls[0];
      const encoded = Buffer.from('user:pass').toString('base64');
      expect(call[1].headers.Authorization).toBe(`Basic ${encoded}`);
    });

    test('adds custom headers', async () => {
      mockFetch({ data: 'test' });

      await http.withHeaders({
        'X-Custom': 'value',
        'X-API-Key': 'key123',
      }).get('/api');

      const call = global.fetch.mock.calls[0];
      expect(call[1].headers['X-Custom']).toBe('value');
      expect(call[1].headers['X-API-Key']).toBe('key123');
    });
  });

  describe('Retry Logic', () => {
    test('retries on failure', async () => {
      let attempts = 0;
      global.fetch = jest.fn(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      const response = await http.retry(3).get('/flaky');

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(await response.json()).toEqual({ success: true });
    });

    test('respects retry delay', async () => {
      const start = Date.now();
      let attempts = 0;

      global.fetch = jest.fn(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('Error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      });

      await http.retry(2, 100).get('/test');

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('Timeout', () => {
    test('respects timeout setting', async () => {
      global.fetch = jest.fn(() => new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: 'slow' }),
        }), 10000);
      }));

      await expect(
        http.timeout(100).get('/slow')
      ).rejects.toThrow();
    });
  });

  describe('Response Handling', () => {
    test('throws on 404', async () => {
      mockFetch({ error: 'Not Found' }, { ok: false, status: 404 });

      await expect(http.get('/notfound')).rejects.toThrow();
    });

    test('throws on 500', async () => {
      mockFetch({ error: 'Server Error' }, { ok: false, status: 500 });

      await expect(http.get('/error')).rejects.toThrow();
    });

    test('accepts non-2xx status with accept method', async () => {
      mockFetch({ error: 'Not Found' }, { ok: false, status: 404 });

      const response = await http.accept(404).get('/notfound');

      expect(response.status).toBe(404);
    });
  });

  describe('Request Hooks', () => {
    test('calls before hook', async () => {
      mockFetch({ data: 'test' });
      const beforeHook = jest.fn();

      await http.beforeRequest(beforeHook).get('/test');

      expect(beforeHook).toHaveBeenCalled();
    });

    test('calls after hook', async () => {
      mockFetch({ data: 'test' });
      const afterHook = jest.fn();

      await http.afterResponse(afterHook).get('/test');

      expect(afterHook).toHaveBeenCalled();
    });
  });

  describe('Concurrent Requests', () => {
    test('sends concurrent requests', async () => {
      mockFetch({ data: 'test' });

      const responses = await http.pool([
        { method: 'GET', url: '/users' },
        { method: 'GET', url: '/posts' },
        { method: 'GET', url: '/comments' },
      ]);

      expect(responses).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
