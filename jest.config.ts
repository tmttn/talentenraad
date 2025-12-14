import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

const customJestConfig: Config = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/app/$1',
		'^@components/(.*)$': '<rootDir>/app/components/$1',
		'^@features/(.*)$': '<rootDir>/app/features/$1',
	},
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
	collectCoverageFrom: [
		'app/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		// Exclude index/barrel files (just re-exports)
		'!app/components/index.ts',
		'!app/components/ui/index.ts',
		// Exclude API routes (require different testing approach)
		'!app/api/**',
	],
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 50,
			lines: 50,
			statements: 50,
		},
	},
};

export default createJestConfig(customJestConfig);
