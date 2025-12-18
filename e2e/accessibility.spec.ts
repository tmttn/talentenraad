import {expect, test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility tests using axe-core.
 * Tests for WCAG 2.1 AA compliance including color contrast.
 */

// Pages to test for accessibility
const pagesToTest = [
	{name: 'Homepage', path: '/'},
	{name: 'Activiteiten', path: '/activiteiten'},
	{name: 'Nieuws', path: '/nieuws'},
	{name: 'Contact', path: '/contact'},
	{name: 'Over ons', path: '/over-ons'},
];

for (const page of pagesToTest) {
	test.describe(`Accessibility: ${page.name}`, () => {
		test(`should have no accessibility violations on ${page.path}`, async ({page: browserPage}) => {
			await browserPage.goto(page.path);

			// Wait for page to be fully loaded
			await browserPage.waitForLoadState('networkidle');

			// Run axe accessibility scan
			const accessibilityScanResults = await new AxeBuilder({page: browserPage})
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
				.analyze();

			// Output detailed results for debugging
			if (accessibilityScanResults.violations.length > 0) {
				console.log(`\n=== Accessibility Violations on ${page.path} ===`);
				for (const violation of accessibilityScanResults.violations) {
					console.log(`\n[${violation.impact?.toUpperCase()}] ${violation.id}: ${violation.description}`);
					console.log(`Help: ${violation.helpUrl}`);
					console.log('Affected elements:');
					for (const node of violation.nodes) {
						console.log(`  - ${node.target.join(' > ')}`);
						console.log(`    HTML: ${node.html.slice(0, 200)}...`);
						if (node.failureSummary) {
							console.log(`    Fix: ${node.failureSummary}`);
						}
					}
				}
			}

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test(`should have sufficient color contrast on ${page.path}`, async ({page: browserPage}) => {
			await browserPage.goto(page.path);
			await browserPage.waitForLoadState('networkidle');

			// Run axe scan specifically for color contrast
			const contrastResults = await new AxeBuilder({page: browserPage})
				.withRules(['color-contrast', 'color-contrast-enhanced'])
				.analyze();

			if (contrastResults.violations.length > 0) {
				console.log(`\n=== Color Contrast Issues on ${page.path} ===`);
				for (const violation of contrastResults.violations) {
					console.log(`\n${violation.description}`);
					for (const node of violation.nodes) {
						console.log(`  Element: ${node.target.join(' > ')}`);
						console.log(`  HTML: ${node.html.slice(0, 150)}`);
						// Extract contrast ratio from the message if available
						const message = node.any?.[0]?.message ?? node.failureSummary ?? '';
						console.log(`  Issue: ${message}`);
					}
				}
			}

			expect(contrastResults.violations).toEqual([]);
		});
	});
}

test.describe('Accessibility: Interactive elements', () => {
	test('should have accessible navigation', async ({page}) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Check navigation landmarks
		const nav = page.locator('nav');
		await expect(nav.first()).toBeVisible();

		// Check all links have accessible names
		const links = page.locator('a');
		const linkCount = await links.count();

		for (let i = 0; i < linkCount; i++) {
			const link = links.nth(i);
			const accessibleName = await link.evaluate(el => {
				const ariaLabel = el.getAttribute('aria-label');
				const textContent = el.textContent?.trim();
				const title = el.getAttribute('title');
				return ariaLabel ?? textContent ?? title ?? '';
			});

			if (await link.isVisible()) {
				expect(accessibleName.length, `Link ${i} should have accessible name`).toBeGreaterThan(0);
			}
		}
	});

	test('should have accessible form controls', async ({page}) => {
		await page.goto('/contact');
		await page.waitForLoadState('networkidle');

		// Run axe scan for form-related rules
		const formResults = await new AxeBuilder({page})
			.withRules([
				'label',
				'form-field-multiple-labels',
				'select-name',
				'input-button-name',
			])
			.analyze();

		if (formResults.violations.length > 0) {
			console.log('\n=== Form Accessibility Issues ===');
			for (const violation of formResults.violations) {
				console.log(`\n${violation.id}: ${violation.description}`);
				for (const node of violation.nodes) {
					console.log(`  - ${node.target.join(' > ')}`);
				}
			}
		}

		expect(formResults.violations).toEqual([]);
	});
});
