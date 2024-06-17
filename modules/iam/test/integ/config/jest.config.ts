import type { Config } from '@jest/types';
import rootConfig from '../../../jest.config';

const config: Config.InitialOptions = {
  ...rootConfig,
  displayName: 'INTEGRATION',
  testTimeout: 120000,
  testMatch: ['<rootDir>/test/integ/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/integ/config/jest.setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'main_api.ts', 'Server.ts', '/test', './src/main.ts'],
  collectCoverageFrom: ['<rootDir>/src/infra/**/*.ts'],
};

export default config;
