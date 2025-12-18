/**
 * Tests for MainSiteLayout
 *
 * Note: The MainSiteLayout is an async server component that uses dynamic imports
 * and Suspense boundaries. These features are difficult to test with React Testing
 * Library's synchronous render. The actual layout functionality is verified through:
 * - Integration tests (e2e)
 * - Build-time type checking
 * - Manual testing in dev/prod environments
 *
 * This file verifies the module can be imported correctly.
 */

import MainSiteLayout from '../../../app/(main)/layout';

describe('MainSiteLayout', () => {
	it('exports a default function component', () => {
		expect(typeof MainSiteLayout).toBe('function');
		expect(MainSiteLayout.name).toBe('MainSiteLayout');
	});
});
