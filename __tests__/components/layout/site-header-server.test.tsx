import {render, screen} from '@testing-library/react';
import {SiteHeaderServer} from '../../../app/components/layout/site-header-server';

// Mock the Builder.io SDK
jest.mock('@builder.io/sdk-react-nextjs', () => ({
	fetchOneEntry: jest.fn(),
}));

// Mock usePathname for SiteHeader
jest.mock('next/navigation', () => ({
	usePathname: () => '/',
}));

// Import the mocked module
import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';
const mockFetchOneEntry = fetchOneEntry as jest.MockedFunction<typeof fetchOneEntry>;

describe('SiteHeaderServer', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders SiteHeader with data from Builder.io', async () => {
		mockFetchOneEntry.mockResolvedValueOnce({
			data: {
				logoUrl: '/custom-logo.png',
				logoAlt: 'Custom Logo Alt',
				navigationLinks: [
					{text: 'Custom Link', url: '/custom'},
				],
			},
		} as never);

		const Component = await SiteHeaderServer();
		render(Component);

		expect(screen.getByRole('img', {name: 'Custom Logo Alt'})).toBeInTheDocument();
		expect(screen.getByRole('link', {name: 'Custom Link'})).toHaveAttribute('href', '/custom');
	});

	it('renders SiteHeader with defaults when Builder.io returns no data', async () => {
		mockFetchOneEntry.mockResolvedValueOnce(null as never);

		const Component = await SiteHeaderServer();
		render(Component);

		// Should render with default navigation
		expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
	});

	it('renders SiteHeader with defaults when Builder.io throws error', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
		mockFetchOneEntry.mockRejectedValueOnce(new Error('API Error'));

		const Component = await SiteHeaderServer();
		render(Component);

		// Should still render with defaults
		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(consoleSpy).toHaveBeenCalledWith('Error fetching site header:', expect.any(Error));

		consoleSpy.mockRestore();
	});

	it('fetches from site-header model with correct API key', async () => {
		mockFetchOneEntry.mockResolvedValueOnce(null as never);

		await SiteHeaderServer();

		expect(mockFetchOneEntry).toHaveBeenCalledWith({
			model: 'site-header',
			apiKey: expect.any(String),
		});
	});

	it('handles empty data object from Builder.io', async () => {
		mockFetchOneEntry.mockResolvedValueOnce({
			data: {},
		} as never);

		const Component = await SiteHeaderServer();
		render(Component);

		// Should render with defaults
		expect(screen.getByRole('banner')).toBeInTheDocument();
	});
});
