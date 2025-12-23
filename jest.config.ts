import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig: Config = {
  setupFiles: ['<rootDir>/jest.env.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@components/(.*)$': '<rootDir>/app/components/$1',
    '^@features/(.*)$': '<rootDir>/app/features/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Exclude index/barrel files (just re-exports)
    '!app/components/index.ts',
    '!app/components/ui/index.ts',
    // Exclude API routes (require integration testing with real HTTP)
    '!app/api/**',
    // Exclude admin route group (requires Auth0 session mocking)
    String.raw`!app/\(admin\)/**`,
    // Exclude database layer (requires real DB connection)
    '!app/lib/db/**',
    // Exclude email service (sends real emails)
    '!app/lib/email/**',
    // Exclude admin features (requires Auth0 session)
    '!app/features/admin/**',
  ],
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 45,
      lines: 50,
      statements: 50,
    },
  },
};

export default createJestConfig(customJestConfig);
