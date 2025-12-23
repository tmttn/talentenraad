import {render, screen} from '@testing-library/react';
import {PageWithAnnouncements} from '../../../app/components/layout/page-with-announcements';

// Mock builder-utils
jest.mock('../../../app/lib/builder-utils', () => ({
  fetchGlobalAnnouncement: jest.fn(),
  extractPageAnnouncement: jest.fn(),
}));

// Mock child components
jest.mock('@features/marketing/announcements-container', () => ({
  AnnouncementsContainer: ({globalAnnouncement, pageAnnouncement}: {globalAnnouncement?: unknown; pageAnnouncement?: unknown}) => (
    <div data-testid='announcements-container'>
      {globalAnnouncement && <div data-testid='global-announcement'>Global</div>}
      {pageAnnouncement && <div data-testid='page-announcement'>Page</div>}
    </div>
  ),
}));

jest.mock('@components/layout/site-header-server', () => ({
  SiteHeaderServer: () => <header data-testid='site-header'>Header</header>,
}));

// Import the mocked modules
import {fetchGlobalAnnouncement, extractPageAnnouncement} from '../../../app/lib/builder-utils';

const mockFetchGlobalAnnouncement = fetchGlobalAnnouncement as jest.MockedFunction<typeof fetchGlobalAnnouncement>;
const mockExtractPageAnnouncement = extractPageAnnouncement as jest.MockedFunction<typeof extractPageAnnouncement>;

describe('PageWithAnnouncements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children within main content area', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce(undefined);

    const Component = await PageWithAnnouncements({
      content: undefined,
      children: <div data-testid='child-content'>Child Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders SiteHeaderServer', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce(undefined);

    const Component = await PageWithAnnouncements({
      content: undefined,
      children: <div>Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
  });

  it('renders AnnouncementsContainer', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce(undefined);

    const Component = await PageWithAnnouncements({
      content: undefined,
      children: <div>Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('announcements-container')).toBeInTheDocument();
  });

  it('passes global announcement to AnnouncementsContainer', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce({
      tekst: 'Global message',
      type: 'info',
      link: '/link',
      linkTekst: 'Click here',
      actief: true,
    });
    mockExtractPageAnnouncement.mockReturnValueOnce(undefined);

    const Component = await PageWithAnnouncements({
      content: undefined,
      children: <div>Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('global-announcement')).toBeInTheDocument();
  });

  it('passes page announcement to AnnouncementsContainer', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce({
      tekst: 'Page message',
      type: 'waarschuwing',
    });

    const Component = await PageWithAnnouncements({
      content: {data: {}} as never,
      children: <div>Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('page-announcement')).toBeInTheDocument();
  });

  it('renders both announcements when both exist', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce({
      tekst: 'Global',
      type: 'info',
      actief: true,
    });
    mockExtractPageAnnouncement.mockReturnValueOnce({
      tekst: 'Page',
      type: 'belangrijk',
    });

    const Component = await PageWithAnnouncements({
      content: {data: {}} as never,
      children: <div>Content</div>,
    });
    render(Component);

    expect(screen.getByTestId('global-announcement')).toBeInTheDocument();
    expect(screen.getByTestId('page-announcement')).toBeInTheDocument();
  });

  it('has correct accessibility attributes on main element', async () => {
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce(undefined);

    const Component = await PageWithAnnouncements({
      content: undefined,
      children: <div>Content</div>,
    });
    render(Component);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabIndex', '-1');
  });

  it('extracts page announcement from content', async () => {
    const mockContent = {data: {paginaAankondiging: {actief: true, tekst: 'Test'}}} as never;
    mockFetchGlobalAnnouncement.mockResolvedValueOnce(undefined);
    mockExtractPageAnnouncement.mockReturnValueOnce({tekst: 'Test', type: 'info'});

    await PageWithAnnouncements({
      content: mockContent,
      children: <div>Content</div>,
    });

    expect(mockExtractPageAnnouncement).toHaveBeenCalledWith(mockContent);
  });
});
