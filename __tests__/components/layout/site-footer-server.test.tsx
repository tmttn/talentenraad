import {render, screen} from '@testing-library/react';
import {SiteFooterServer} from '../../../app/components/layout/site-footer-server';

// Mock the Builder.io SDK
jest.mock('@builder.io/sdk-react-nextjs', () => ({
  fetchOneEntry: jest.fn(),
}));

// Mock cookie consent
jest.mock('@components/cookie-consent', () => ({
  useCookieConsent: () => ({
    openPreferences: jest.fn(),
  }),
}));

// Import the mocked module
import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';

const mockFetchOneEntry = fetchOneEntry as jest.MockedFunction<typeof fetchOneEntry>;

describe('SiteFooterServer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders SiteFooter with data from Builder.io', async () => {
    mockFetchOneEntry.mockResolvedValueOnce({
      data: {
        logoUrl: '/custom-logo.png',
        tagline: 'Custom Tagline',
        email: 'custom@example.com',
        address: {
          street: 'Custom Street 123',
          city: 'Custom City',
        },
        copyrightText: 'Custom Copyright',
      },
    } as never);

    const Component = await SiteFooterServer();
    render(Component);

    expect(screen.getByText('Custom Tagline')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'custom@example.com'})).toBeInTheDocument();
    expect(screen.getByText('Custom Street 123')).toBeInTheDocument();
    expect(screen.getByText('Custom City')).toBeInTheDocument();
  });

  it('renders SiteFooter with defaults when Builder.io returns no data', async () => {
    mockFetchOneEntry.mockResolvedValueOnce(null as never);

    const Component = await SiteFooterServer();
    render(Component);

    // Should render with default navigation
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders SiteFooter with defaults when Builder.io throws error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchOneEntry.mockRejectedValueOnce(new Error('API Error'));

    const Component = await SiteFooterServer();
    render(Component);

    // Should still render with defaults
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching site footer:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('fetches from site-footer model with correct API key', async () => {
    mockFetchOneEntry.mockResolvedValueOnce(null as never);

    await SiteFooterServer();

    expect(mockFetchOneEntry).toHaveBeenCalledWith({
      model: 'site-footer',
      apiKey: expect.any(String),
    });
  });

  it('renders navigation groups from Builder.io', async () => {
    mockFetchOneEntry.mockResolvedValueOnce({
      data: {
        navigationGroups: [
          {
            title: 'Test Group',
            links: [{text: 'Test Link', url: '/test'}],
          },
        ],
      },
    } as never);

    const Component = await SiteFooterServer();
    render(Component);

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Test Link'})).toHaveAttribute('href', '/test');
  });

  it('renders social links from Builder.io', async () => {
    mockFetchOneEntry.mockResolvedValueOnce({
      data: {
        socialLinks: [
          {platform: 'facebook', url: 'https://facebook.com/test'},
        ],
      },
    } as never);

    const Component = await SiteFooterServer();
    render(Component);

    expect(screen.getByRole('link', {name: 'facebook (opent in nieuw venster)'})).toHaveAttribute('href', 'https://facebook.com/test');
  });
});
