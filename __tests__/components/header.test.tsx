import {render, screen} from '@testing-library/react';
import {SiteHeader, SiteHeaderInfo} from '../../app/components/layout/site-header';

// Mock usePathname
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock icons
jest.mock('@components/ui', () => ({
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

  it('has correct SiteHeaderInfo export properties', () => {
    expect(SiteHeaderInfo.name).toBe('SiteHeader');
    expect(SiteHeaderInfo.component).toBeDefined();
    expect(SiteHeaderInfo.inputs).toBeDefined();
    expect(SiteHeaderInfo.inputs.length).toBeGreaterThan(0);
  });
});
