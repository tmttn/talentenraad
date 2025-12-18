import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright configuration for accessibility and performance testing.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [
		['html', {open: 'never'}],
		['json', {outputFile: 'e2e/results/test-results.json'}],
	],
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'chromium',
			use: {...devices['Desktop Chrome']},
		},
	],
	// Start dev server before running tests
	webServer: {
		command: 'npm run dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
	// Output directory for test artifacts
	outputDir: 'e2e/results',
});
