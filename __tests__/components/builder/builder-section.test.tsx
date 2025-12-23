import {render, screen, waitFor} from '@testing-library/react';
import {
  BuilderSection,
  AnnouncementBarSection,
  HeroSection,
  CTASection,
  FooterCTASection,
  FAQSection,
  SiteHeaderSection,
  SiteFooterSection,
} from '../../../app/components/builder/builder-section';

// Mock Builder.io SDK
const mockFetchOneEntry = jest.fn();
jest.mock('@builder.io/sdk-react-nextjs', () => ({
  fetchOneEntry: (...args: unknown[]) => mockFetchOneEntry(...args),
  Content: jest.fn(({model}) => (
    <div data-testid='builder-content' data-model={model}>
      Mock Builder Content
    </div>
  )),
}));

describe('BuilderSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows nothing while loading', () => {
    mockFetchOneEntry.mockImplementation(() => new Promise(() => {})); // Never resolves

    const {container} = render(<BuilderSection model='test-model' />);

    expect(container.firstChild).toBeNull();
  });

  it('renders content when fetched successfully', async () => {
    mockFetchOneEntry.mockResolvedValue({
      id: 'test-id',
      data: {title: 'Test'},
    });

    render(<BuilderSection model='test-model' />);

    await waitFor(() => {
      expect(screen.getByTestId('builder-content')).toBeInTheDocument();
    });
  });

  it('renders nothing when no content is returned', async () => {
    mockFetchOneEntry.mockResolvedValue(null);

    const {container} = render(<BuilderSection model='test-model' />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalled();
    });

    // Should still be null after loading completes with no content
    await waitFor(() => {
      expect(container.querySelector('[data-testid="builder-content"]')).not.toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockFetchOneEntry.mockRejectedValue(new Error('Fetch failed'));

    const {container} = render(<BuilderSection model='test-model' />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(container.querySelector('[data-testid="builder-content"]')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('passes url to fetchOneEntry', async () => {
    mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});

    render(<BuilderSection model='test-model' url='/custom-url' />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({
        userAttributes: expect.objectContaining({
          urlPath: '/custom-url',
        }),
      }));
    });
  });
});

describe('Specific Section Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchOneEntry.mockResolvedValue({id: 'test-id', data: {}});
  });

  it('AnnouncementBarSection uses announcement-bar model', async () => {
    render(<AnnouncementBarSection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'announcement-bar'}));
    });
  });

  it('HeroSection uses hero-section model', async () => {
    render(<HeroSection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'hero-section'}));
    });
  });

  it('HeroSection passes url prop', async () => {
    render(<HeroSection url='/about' />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({
        userAttributes: expect.objectContaining({
          urlPath: '/about',
        }),
      }));
    });
  });

  it('CTASection uses cta-section model', async () => {
    render(<CTASection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'cta-section'}));
    });
  });

  it('FooterCTASection uses footer-cta model', async () => {
    render(<FooterCTASection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'footer-cta'}));
    });
  });

  it('FAQSection uses faq-section model', async () => {
    render(<FAQSection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'faq-section'}));
    });
  });

  it('SiteHeaderSection uses site-header model', async () => {
    render(<SiteHeaderSection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'site-header'}));
    });
  });

  it('SiteFooterSection uses site-footer model', async () => {
    render(<SiteFooterSection />);

    await waitFor(() => {
      expect(mockFetchOneEntry).toHaveBeenCalledWith(expect.objectContaining({model: 'site-footer'}));
    });
  });
});
