/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  testTimeout: 60000,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'main_api.ts', 'Server.ts', '/src/infra/http', '/test/helpers'],
  coverageThreshold: {
    global: {
      branches: 97,
      functions: 97,
      lines: 97,
      statements: 97,
    },
  },
};
