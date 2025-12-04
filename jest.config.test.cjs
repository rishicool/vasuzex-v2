module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.cjs'],
  collectCoverageFrom: [
    'framework/**/*.js',
    'bin/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
