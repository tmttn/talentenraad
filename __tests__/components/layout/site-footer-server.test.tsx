import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import {fixtureSite} from '../../fixtures/site';
import {SiteFooterServer} from '../../../app/components/layout/site-footer-server';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));

vi.mock('@components/cookie-consent', () => ({
  useCookieConsent: () => ({
    openPreferences: vi.fn(),
  }),
}));

describe('SiteFooterServer', () => {
  beforeEach(() => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);
  });

  it('renders tagline, address and email', async () => {
    render(await SiteFooterServer());

    expect(screen.getByText(/Een fictieve ouderraad/)).toBeInTheDocument();
    expect(screen.getByText('Voorbeeldstraat 1')).toBeInTheDocument();
    expect(screen.getByText('1000 Voorbeeldstad')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'info@voorbeeld.test'})).toHaveAttribute('href', 'mailto:info@voorbeeld.test');
  });

  it('renders the groepen with their links', async () => {
    render(await SiteFooterServer());

    expect(screen.getByText('Eerste groep')).toBeInTheDocument();
    expect(screen.getByText('Tweede groep')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Binnenlands'})).toHaveAttribute('href', '/binnen');
  });

  it('opens external links in a new window and keeps internal links in place', async () => {
    render(await SiteFooterServer());

    const external = screen.getByRole('link', {name: 'Buitenlands (opent in nieuw venster)'});
    expect(external).toHaveAttribute('href', 'https://voorbeeld.test/buiten');
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');

    const internal = screen.getByRole('link', {name: 'Binnenlands'});
    expect(internal).not.toHaveAttribute('target');
    expect(internal).not.toHaveAttribute('rel');
  });

  it('renders social links in a new window', async () => {
    render(await SiteFooterServer());

    const facebook = screen.getByRole('link', {name: 'facebook (opent in nieuw venster)'});
    expect(facebook).toHaveAttribute('href', 'https://facebook.test/raad');
    expect(facebook).toHaveAttribute('target', '_blank');
    expect(facebook).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByRole('link', {name: 'instagram (opent in nieuw venster)'})).toBeInTheDocument();
  });

  it('renders the copyright text', async () => {
    render(await SiteFooterServer());

    expect(screen.getByText(/Voorbeeldraad\. Alle rechten voorbehouden\./)).toBeInTheDocument();
  });
});
