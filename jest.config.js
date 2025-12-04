export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^#framework$': '<rootDir>/framework/index.js',
    '^#framework/(.*)$': '<rootDir>/framework/$1',
    '^#database$': '<rootDir>/database/index.js',
    '^#database/(.*)$': '<rootDir>/database/$1',
    '^#models$': '<rootDir>/database/models/index.js',
    '^#models/(.*)$': '<rootDir>/database/models/$1',
    '^#config$': '<rootDir>/config/index.cjs',
    '^#config/(.*)$': '<rootDir>/config/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'framework/**/*.js',
    '!framework/**/index.js',
    '!framework/Console/**',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/apps/',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
};
