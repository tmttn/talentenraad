import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
	dir: './',
});

const customJestConfig: Config = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.tsx'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
	collectCoverageFrom: [
		'app/**/*.{ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
		'!app/activiteiten/**',
		'!app/nieuws/**',
		'!app/api/**',
		'!app/components/activiteiten-list.tsx',
		'!app/components/announcement-banner.tsx',
		'!app/components/builder-section.tsx',
		'!app/components/calendar-section.tsx',
		'!app/components/contact-form.tsx',
		'!app/components/cta-banner.tsx',
		'!app/components/decorations.tsx',
		'!app/components/event-card.tsx',
		'!app/components/faq.tsx',
		'!app/components/feature-grid.tsx',
		'!app/components/hero.tsx',
		'!app/components/info-card.tsx',
		'!app/components/news-card.tsx',
		'!app/components/nieuws-list.tsx',
		'!app/components/section.tsx',
		'!app/components/team-grid.tsx',
		'!app/components/team-member.tsx',
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
