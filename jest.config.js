/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testTimeout: 60000,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'main_api.ts', 'Server.ts', '/src/infra/http', '/test/helpers'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  coverageThreshold: {
    global: {
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
