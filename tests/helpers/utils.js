/**
 * Test Helper Utilities
 */

import { jest } from '@jest/globals';

/**
 * Wait for specified milliseconds
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Expect function to throw async
 */
export const expectAsync = async (fn, ErrorClass, message) => {
  try {
    await fn();
    throw new Error('Expected function to throw, but it did not');
  } catch (error) {
    if (ErrorClass) {
      expect(error).toBeInstanceOf(ErrorClass);
    }
    if (message) {
      expect(error.message).toContain(message);
    }
  }
};

/**
 * Mock fetch for HTTP tests
 */
export const mockFetch = (response, options = {}) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: options.ok !== undefined ? options.ok : true,
      status: options.status || 200,
      statusText: options.statusText || 'OK',
      headers: new Map(Object.entries(options.headers || {})),
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      ...options,
    })
  );
  return global.fetch;
};

/**
 * Restore fetch
 */
export const restoreFetch = () => {
  if (global.fetch && global.fetch.mockRestore) {
    global.fetch.mockRestore();
  }
  delete global.fetch;
};

/**
 * Create spy
 */
export const spy = () => jest.fn();

/**
 * Create mock with implementation
 */
export const mock = (implementation) => jest.fn(implementation);

/**
 * Assert array contains
 */
export const assertArrayContains = (array, item) => {
  expect(array).toContain(item);
};

/**
 * Assert object has keys
 */
export const assertHasKeys = (obj, keys) => {
  keys.forEach(key => {
    expect(obj).toHaveProperty(key);
  });
};

/**
 * Assert date is recent (within last N seconds)
 */
export const assertDateRecent = (date, seconds = 5) => {
  const now = new Date();
  const diff = (now - new Date(date)) / 1000;
  expect(diff).toBeLessThan(seconds);
};

/**
 * Create temporary directory
 */
export const createTempDir = async () => {
  const { mkdtemp } = await import('fs/promises');
  const { tmpdir } = await import('os');
  const { join } = await import('path');
  return await mkdtemp(join(tmpdir(), 'vasuzex-test-'));
};

/**
 * Remove directory recursively
 */
export const removeDir = async (dir) => {
  const { rm } = await import('fs/promises');
  await rm(dir, { recursive: true, force: true });
};

/**
 * Create test file
 */
export const createTestFile = async (path, content) => {
  const { writeFile } = await import('fs/promises');
  await writeFile(path, content);
};

/**
 * Read test file
 */
export const readTestFile = async (path) => {
  const { readFile } = await import('fs/promises');
  return await readFile(path, 'utf-8');
};

export default {
  wait,
  expectAsync,
  mockFetch,
  restoreFetch,
  spy,
  mock,
  assertArrayContains,
  assertHasKeys,
  assertDateRecent,
  createTempDir,
  removeDir,
  createTestFile,
  readTestFile,
};
