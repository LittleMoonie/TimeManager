// jest.config.js (CJS)
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  // Mirror tsconfig paths (no src/)
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, { prefix: '<rootDir>/' }),
    '^bcrypt$': '<rootDir>/Tests/__mocks__/bcrypt',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!uuid|tsoa)/'], // if you import 'uuid' or 'tsoa'
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // Adapt coverage to your tree (no src/)
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/Routes/Generated/**',
    '!**/Server/Database.ts',
    '!**/Server/index.ts',
    '!**/Config/**',
    '!**/Middlewares/**',
    '!**/Utils/**',
    '!**/Errors/**',
    '!**/Entities/**',
    '!**/Repositories/**',
    '!**/Dtos/**'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }
  }
};