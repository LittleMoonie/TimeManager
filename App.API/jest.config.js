module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['node_modules'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  testMatch: ['<rootDir>/Tests/**/*.Test.ts'],
};