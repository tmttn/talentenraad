import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import {fixtureSite} from '../../fixtures/site';
import {PageWithAnnouncements} from '../../../app/components/layout/page-with-announcements';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));

vi.mock('@features/marketing/announcements-container', () => ({
  AnnouncementsContainer: ({globalAnnouncement}: {
    globalAnnouncement?: {tekst: string; link?: string; linkTekst?: string};
  }) => (
    <div data-testid='announcements-container'>
      {globalAnnouncement && (
        <div data-testid='global-announcement' data-link={globalAnnouncement.link} data-linktekst={globalAnnouncement.linkTekst}>{globalAnnouncement.tekst}</div>
      )}
    </div>
  ),
}));

vi.mock('@components/layout/site-header-server', () => ({
  SiteHeaderServer: () => <header data-testid='site-header'>Header</header>,
}));

describe('PageWithAnnouncements', () => {
  beforeEach(() => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders children within main content area', async () => {
    render(await PageWithAnnouncements({
      children: <div data-testid='child-content'>Child Content</div>,
    }));

    expect(screen.getByRole('main')).toContainElement(screen.getByTestId('child-content'));
  });

  it('renders SiteHeaderServer', async () => {
    render(await PageWithAnnouncements({children: <div>Content</div>}));

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
  });

  it('passes the active announcement from site content', async () => {
    render(await PageWithAnnouncements({children: <div>Content</div>}));

    expect(screen.getByTestId('global-announcement')).toHaveTextContent('Fictieve aankondiging');
    expect(screen.getByTestId('global-announcement')).toHaveAttribute('data-link', '/meer');
  });

  it('passes linkTekst through from site content', async () => {
    vi.mocked(content.getSite).mockReturnValue({
      ...fixtureSite,
      aankondiging: {...fixtureSite.aankondiging, linkTekst: 'Lees verder'},
    });

    render(await PageWithAnnouncements({children: <div>Content</div>}));

    expect(screen.getByTestId('global-announcement')).toHaveAttribute('data-linktekst', 'Lees verder');
  });

  it('passes no linkTekst when none is set (old behaviour: no link shown)', async () => {
    render(await PageWithAnnouncements({children: <div>Content</div>}));

    expect(screen.getByTestId('global-announcement')).not.toHaveAttribute('data-linktekst');
  });

  it('renders no global announcement when aankondiging.actief is false', async () => {
    vi.mocked(content.getSite).mockReturnValue({
      ...fixtureSite,
      aankondiging: {...fixtureSite.aankondiging, actief: false},
    });

    render(await PageWithAnnouncements({children: <div>Content</div>}));

    expect(screen.queryByTestId('global-announcement')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes on main element', async () => {
    render(await PageWithAnnouncements({children: <div>Content</div>}));

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabIndex', '-1');
  });
});
