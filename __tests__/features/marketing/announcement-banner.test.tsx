import {
  render, screen, waitFor, fireEvent,
} from '@testing-library/react';
import {AnnouncementBanner} from '../../../app/features/marketing/announcement-banner';

// Mock the UI components
jest.mock('../../../app/components/ui', () => ({
  InfoIcon: () => <svg data-testid='icon-info' />,
  WarningIcon: () => <svg data-testid='icon-warning' />,
  StarIcon: () => <svg data-testid='icon-star' />,
  XIcon: () => <svg data-testid='icon-x' />,
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders nothing when no announcement', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({results: []}),
    });

    const {container} = render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders nothing when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Fetch failed'));

    const {container} = render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders nothing when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    const {container} = render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders announcement text', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          id: '1',
          data: {
            tekst: 'Test announcement',
            type: 'info',
            actief: true,
          },
        }],
      }),
    });

    render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(screen.getByText('Test announcement')).toBeInTheDocument();
    });
  });

  it('renders announcement with link', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{
          id: '1',
          data: {
            tekst: 'Check this out',
            link: '/more-info',
            linkTekst: 'Learn more',
            type: 'info',
            actief: true,
          },
        }],
      }),
    });

    render(<AnnouncementBanner />);

    await waitFor(() => {
      const link = screen.getByRole('link', {name: /learn more/i});
      expect(link).toHaveAttribute('href', '/more-info');
    });
  });

  describe('announcement types', () => {
    it('renders info type with correct styling', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [{id: '1', data: {tekst: 'Info', type: 'info', actief: true}}],
        }),
      });

      const {container} = render(<AnnouncementBanner />);

      await waitFor(() => {
        const banner = container.querySelector('[role="alert"]');
        expect(banner).toHaveClass('bg-info-600');
      });
    });

    it('renders waarschuwing type with correct styling', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [{id: '1', data: {tekst: 'Warning', type: 'waarschuwing', actief: true}}],
        }),
      });

      const {container} = render(<AnnouncementBanner />);

      await waitFor(() => {
        const banner = container.querySelector('[role="alert"]');
        expect(banner).toHaveClass('bg-warning-500');
      });
    });

    it('renders belangrijk type with correct styling', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [{id: '1', data: {tekst: 'Important', type: 'belangrijk', actief: true}}],
        }),
      });

      const {container} = render(<AnnouncementBanner />);

      await waitFor(() => {
        const banner = container.querySelector('[role="alert"]');
        expect(banner).toHaveClass('bg-primary');
      });
    });

    it('falls back to info styling for unknown type', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          // @ts-expect-error Testing invalid type
          results: [{id: '1', data: {tekst: 'Unknown', type: 'unknown', actief: true}}],
        }),
      });

      const {container} = render(<AnnouncementBanner />);

      await waitFor(() => {
        const banner = container.querySelector('[role="alert"]');
        expect(banner).toHaveClass('bg-info-600');
      });
    });
  });

  it('can be dismissed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{id: '1', data: {tekst: 'Dismissable', type: 'info', actief: true}}],
      }),
    });

    const {container} = render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(screen.getByText('Dismissable')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {name: /sluiten/i});
    fireEvent.click(closeButton);

    expect(container.firstChild).toBeNull();
  });

  it('has role="alert" for accessibility', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        results: [{id: '1', data: {tekst: 'Alert', type: 'info', actief: true}}],
      }),
    });

    render(<AnnouncementBanner />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
