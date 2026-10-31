import {render, screen} from '@testing-library/react';
import {SponsorBannerInfo} from '../../../app/features/sponsors/sponsor-banner';

const SponsorBanner = SponsorBannerInfo.component;

class FakeIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;

const logo = {src: '/logo.png', width: 100, height: 50};
const goud = {naam: 'Gouden Voorbeeld', niveau: 'goud' as const, logo, link: 'https://voorbeeld.test'};
const zilver = {naam: 'Zilveren Voorbeeld', niveau: 'zilver' as const, logo};

describe('SponsorBanner', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders nothing when hidden', () => {
    const {container} = render(<SponsorBanner hidden sponsors={[goud]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing without sponsors', () => {
    const {container} = render(<SponsorBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the first sponsor by level with title and badge', () => {
    render(<SponsorBanner sponsors={[zilver, goud]} />);
    expect(screen.getByText('Met dank aan onze sponsors')).toBeInTheDocument();
    expect(screen.getByText('Goud')).toBeInTheDocument();
    expect(screen.getByAltText('Gouden Voorbeeld')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://voorbeeld.test');
  });

  it('uses a custom title', () => {
    render(<SponsorBanner title='Onze Partners' sponsors={[goud]} />);
    expect(screen.getByText('Onze Partners')).toBeInTheDocument();
  });

  it('hides the tier badge when showTierBadge is false', () => {
    render(<SponsorBanner showTierBadge={false} sponsors={[goud]} />);
    expect(screen.queryByText('Goud')).not.toBeInTheDocument();
  });

  it('renders the minimal variant without title or badge', () => {
    render(<SponsorBanner variant='minimal' sponsors={[goud]} />);
    expect(screen.getByAltText('Gouden Voorbeeld')).toBeInTheDocument();
    expect(screen.queryByText('Met dank aan onze sponsors')).not.toBeInTheDocument();
    expect(screen.queryByText('Goud')).not.toBeInTheDocument();
  });

  it('shows navigation dots for multiple sponsors', () => {
    render(<SponsorBanner sponsors={[goud, zilver]} />);
    expect(screen.getByLabelText('Ga naar sponsor 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Ga naar sponsor 2')).toBeInTheDocument();
  });

  it('never fetches sponsors itself', () => {
    render(<SponsorBanner sponsors={[goud]} />);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('exports correct component info', () => {
    expect(SponsorBannerInfo.name).toBe('SponsorBanner');
    expect(SponsorBannerInfo.inputs.map(i => i.name)).toEqual([
      'hidden',
      'rotationInterval',
      'showTierBadge',
      'variant',
      'title',
    ]);
  });
});
