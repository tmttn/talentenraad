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

	it('renders body with correct classes', () => {
		render(
			<RootLayout>
				<div>Content</div>
			</RootLayout>,
		);

		// The root layout now just provides the html/body structure
		// The main element is in the (main) route group layout
		expect(document.body).toHaveClass('min-h-screen', 'flex', 'flex-col', 'antialiased', 'bg-white');
	});

	it('wraps children in body element', () => {
		render(
			<RootLayout>
				<span data-testid='child-span'>Child content</span>
			</RootLayout>,
		);

		expect(screen.getByTestId('child-span')).toBeInTheDocument();
		expect(screen.getByText('Child content')).toBeInTheDocument();
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
