import {render, screen} from '@testing-library/react';
import {SiteHeader} from '../../app/components/layout/site-header';

const {mockPathname} = vi.hoisted(() => ({mockPathname: vi.fn(() => '/')}));

vi.mock('next/navigation', () => ({
  usePathname: mockPathname,
}));

// Mock icons
vi.mock('@components/ui', () => ({
  MenuIcon: () => <span data-testid='menu-icon' />,
  XIcon: () => <span data-testid='x-icon' />,
}));

describe('SiteHeader', () => {
  const mockNavigationLinks = [
    {url: '/', text: 'Home'},
    {url: '/about', text: 'About'},
    {url: '/contact', text: 'Contact'},
  ];

  it('renders the logo image', () => {
    render(<SiteHeader />);

    const logo = screen.getByRole('img', {name: 'Talentenraad Logo'});
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation links from props', () => {
    render(<SiteHeader navigationLinks={mockNavigationLinks} />);

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute('href', '/contact');
  });

  it('renders default navigation links when none provided', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Kalender'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Nieuws'})).toBeInTheDocument();
  });

  it('renders custom logo when provided', () => {
    render(<SiteHeader logoUrl='/custom-logo.png' logoAlt='Custom Logo' />);

    const logo = screen.getByRole('img', {name: 'Custom Logo'});
    expect(logo).toBeInTheDocument();
  });

  it('has correct accessibility roles', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', {name: 'Hoofdnavigatie'})).toBeInTheDocument();
  });

  it('has skip to main content link', () => {
    render(<SiteHeader />);

    const skipLink = screen.getByRole('link', {name: 'Ga naar hoofdinhoud'});
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });


  it('shows the contact link as a contour button', () => {
    render(<SiteHeader navigationLinks={[{text: 'Home', url: '/'}, {text: 'Contact', url: '/contact'}]} />);
    const [contact] = screen.getAllByRole('link', {name: 'Contact'});
    expect(contact).toHaveClass('contour-sm', 'shadow-hard-xs', 'bg-primary');
    const [home] = screen.getAllByRole('link', {name: 'Home'});
    expect(home).not.toHaveClass('contour-sm');
  });

  it('underlines the active section and keeps the calendar active on an activity page', () => {
    mockPathname.mockReturnValue('/activiteiten/kerst');
    render(<SiteHeader navigationLinks={[{text: 'Home', url: '/'}, {text: 'Kalender', url: '/kalender'}, {text: 'Nieuws', url: '/nieuws'}]} />);
    const [kalender] = screen.getAllByRole('link', {name: 'Kalender'});
    expect(kalender).toHaveAttribute('aria-current', 'page');
    expect(kalender).toHaveClass('border-primary', 'text-primary-text');
    const [nieuws] = screen.getAllByRole('link', {name: 'Nieuws'});
    expect(nieuws).not.toHaveAttribute('aria-current');
  });

  it('marks home active without an underline, only on the homepage itself', () => {
    mockPathname.mockReturnValue('/');
    render(<SiteHeader navigationLinks={[{text: 'Home', url: '/'}, {text: 'Kalender', url: '/kalender'}]} />);
    const [home] = screen.getAllByRole('link', {name: 'Home'});
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveClass('border-transparent');
    expect(screen.getByRole('banner')).toHaveClass('border-ink');
  });
});
