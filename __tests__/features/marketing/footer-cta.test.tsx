import {render, screen} from '@testing-library/react';
import {content} from '@lib/content';
import {fixtureSite} from '../../fixtures/site';
import {FooterCta, FooterCtaServer} from '../../../app/features/marketing/footer-cta';

vi.mock('@lib/content', () => ({content: {getSite: vi.fn()}}));

describe('FooterCta', () => {
  it('renders title, text and button link', () => {
    render(<FooterCta titel='Titel' tekst='Tekst' knop={{tekst: 'Klik', link: '/pad'}} />);

    expect(screen.getByRole('heading', {name: 'Titel'})).toBeInTheDocument();
    expect(screen.getByText('Tekst')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Klik/})).toHaveAttribute('href', '/pad');
  });

  it('keeps the current button behaviour for external links (same window, no rel)', () => {
    render(<FooterCta titel='Titel' tekst='Tekst' knop={{tekst: 'Extern', link: 'https://voorbeeld.test'}} />);

    const link = screen.getByRole('link', {name: /Extern/});
    expect(link).toHaveAttribute('href', 'https://voorbeeld.test');
    expect(link).not.toHaveAttribute('target');
  });

  it('FooterCtaServer renders cta from site content', async () => {
    vi.mocked(content.getSite).mockReturnValue(fixtureSite);

    render(await FooterCtaServer());

    expect(screen.getByRole('heading', {name: 'Een vraag?'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /Schrijf ons/})).toHaveAttribute('href', '/schrijf');
  });
});
