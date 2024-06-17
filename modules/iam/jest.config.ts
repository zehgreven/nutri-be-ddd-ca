import type { Config } from '@jest/types';
import { resolve } from 'path';

const rootDir = resolve(__dirname);

const config: Config.InitialOptions = {
  rootDir,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 120000,
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'main_api.ts', 'Server.ts', '/test'],
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

export default config;
