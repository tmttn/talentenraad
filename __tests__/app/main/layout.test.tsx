import {render, screen} from '@testing-library/react';
import MainSiteLayout from '../../../app/(main)/layout';

// Mock the SiteFooterServer component
jest.mock('@components/layout/site-footer-server', () => ({
	SiteFooterServer: () => <footer data-testid='site-footer'>Footer</footer>,
}));

// Mock the SeasonalDecorationsServer component (async server component)
jest.mock('@components/seasonal-decorations-server', () => ({
	SeasonalDecorationsServer: ({children}: {children: React.ReactNode}) => <>{children}</>,
}));

// Mock the cookie consent components
jest.mock('@components/cookie-consent', () => ({
	CookieConsentProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
	CookieBanner: () => null,
}));

describe('MainSiteLayout', () => {
	it('renders children', () => {
		render(
			<MainSiteLayout>
				<main data-testid='main-content'>Main Content</main>
			</MainSiteLayout>,
		);

		expect(screen.getByTestId('main-content')).toBeInTheDocument();
		expect(screen.getByText('Main Content')).toBeInTheDocument();
	});

	it('renders the footer', () => {
		render(
			<MainSiteLayout>
				<main>Content</main>
			</MainSiteLayout>,
		);

		expect(screen.getByTestId('site-footer')).toBeInTheDocument();
	});

	it('renders children before footer', () => {
		const {container} = render(
			<MainSiteLayout>
				<main data-testid='main-content'>Content</main>
			</MainSiteLayout>,
		);

		const main = screen.getByTestId('main-content');
		const footer = screen.getByTestId('site-footer');

		// Children should come before footer in DOM order
		expect(container.innerHTML.indexOf('main-content')).toBeLessThan(
			container.innerHTML.indexOf('site-footer'),
		);
	});
});
