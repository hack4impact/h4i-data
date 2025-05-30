import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'], // runs all *.test.ts files in __tests__/
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};

export default config;
