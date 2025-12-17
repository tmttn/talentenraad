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
		// Exclude admin route group (requires auth testing)
		'!app/\\(admin\\)/**',
		// Exclude database layer (requires DB mocking)
		'!app/lib/db/**',
		// Exclude auth config (requires complex mocking)
		'!app/lib/auth/**',
		'!app/lib/auth0.ts',
		// Exclude email service (external service)
		'!app/lib/email/**',
		// Exclude admin features (requires auth)
		'!app/features/admin/**',
		// Exclude Builder.io admin SDK (external service)
		'!app/lib/builder-admin.ts',
		// Exclude reCAPTCHA server validation (external service)
		'!app/lib/recaptcha.ts',
		// Exclude shared types (no logic to test)
		'!app/lib/types.ts',
		// Exclude server components that fetch data (require integration tests)
		'!app/components/layout/site-header-server.tsx',
		'!app/components/layout/site-footer-server.tsx',
		'!app/components/layout/page-with-announcements.tsx',
		'!app/components/seasonal-decorations-server.tsx',
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
