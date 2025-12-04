/**
 * Jest Test Setup
 * 
 * Global test configuration and utilities
 */

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: console.error,
};

// Global test utilities
global.mockEnv = (key, value) => {
  process.env[key] = value;
};

global.restoreEnv = (key) => {
  delete process.env[key];
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
