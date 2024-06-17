import type { Config } from '@jest/types';
import rootConfig from '../../../jest.config';

const config: Config.InitialOptions = {
  ...rootConfig,
  displayName: 'UNIT',
  testTimeout: 60000,
  testMatch: ['<rootDir>/test/unit/**/*.test.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'main_api.ts', 'Server.ts', '/test', './src/main.ts', '/http/'],
};

export default config;
