import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import {fixtureSite} from '../../fixtures/site';
import {SiteHeaderServer} from '../../../app/components/layout/site-header-server';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('SiteHeaderServer', () => {
  beforeEach(() => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders the navigatie links from site content', async () => {
    render(await SiteHeaderServer());

    expect(screen.getAllByRole('link', {name: 'Start'})[0]).toHaveAttribute('href', '/');
    expect(screen.getAllByRole('link', {name: 'Agenda'})[0]).toHaveAttribute('href', '/agenda');
    expect(screen.queryByRole('link', {name: 'Kalender'})).not.toBeInTheDocument();
  });

  it('renders the banner landmark', async () => {
    render(await SiteHeaderServer());

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
