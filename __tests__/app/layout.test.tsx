import {render, screen} from '@testing-library/react';
import RootLayout, {metadata} from '../../app/layout';

// Mock Vercel analytics
jest.mock('@vercel/analytics/react', () => ({
	Analytics: () => null,
}));

jest.mock('@vercel/speed-insights/next', () => ({
	SpeedInsights: () => null,
}));

describe('RootLayout', () => {
	it('renders children content', () => {
		render(
			<RootLayout>
				<div data-testid='test-child'>Test Content</div>
			</RootLayout>,
		);

		expect(screen.getByTestId('test-child')).toBeInTheDocument();
		expect(screen.getByText('Test Content')).toBeInTheDocument();
	});

	it('renders main element with role', () => {
		render(
			<RootLayout>
				<div>Content</div>
			</RootLayout>,
		);

		expect(screen.getByRole('main')).toBeInTheDocument();
	});

	it('wraps children in main element', () => {
		render(
			<RootLayout>
				<span>Child content</span>
			</RootLayout>,
		);

		const main = screen.getByRole('main');
		expect(main).toContainHTML('<span>Child content</span>');
	});
});

describe('metadata', () => {
	it('has correct title', () => {
		expect(metadata.title).toBe('Talentenraad');
	});

	it('has correct description', () => {
		expect(metadata.description).toBe('Website van de Talentenhuis Talentenraad');
	});
});
