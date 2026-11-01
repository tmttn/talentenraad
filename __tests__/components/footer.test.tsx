import {fireEvent, render, screen} from '@testing-library/react';
import {SiteFooter} from '../../app/components/layout/site-footer';

// Mock icons
vi.mock('@components/ui', () => ({
  FacebookIcon: () => <span data-testid='facebook-icon' />,
  InstagramIcon: () => <span data-testid='instagram-icon' />,
  LinkedinIcon: () => <span data-testid='linkedin-icon' />,
  TwitterIcon: () => <span data-testid='twitter-icon' />,
  YoutubeIcon: () => <span data-testid='youtube-icon' />,
}));

describe('SiteFooter', () => {
  const mockNavigationGroups = [
    {
      title: 'Company',
      links: [
        {url: '/about', text: 'About Us'},
        {url: '/careers', text: 'Careers'},
      ],
    },
    {
      title: 'Support',
      links: [
        {url: '/help', text: 'Help Center'},
        {url: '/contact', text: 'Contact'},
      ],
    },
  ];

  it('renders footer with navigation groups from props', () => {
    render(<SiteFooter navigationGroups={mockNavigationGroups} />);

    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders navigation links within groups', () => {
    render(<SiteFooter navigationGroups={mockNavigationGroups} />);

    expect(screen.getByRole('link', {name: 'About Us'})).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', {name: 'Careers'})).toHaveAttribute('href', '/careers');
    expect(screen.getByRole('link', {name: 'Help Center'})).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute('href', '/contact');
  });

  it('renders default navigation when none provided', () => {
    render(<SiteFooter />);

    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('School')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Kalender'})).toHaveAttribute('href', '/kalender');
  });

  it('renders logo', () => {
    render(<SiteFooter />);

    const logo = screen.getByRole('img', {name: 'Talentenraad, naar de startpagina'});
    expect(logo).toBeInTheDocument();
  });

  it('renders tagline', () => {
    render(<SiteFooter tagline='Test tagline' />);

    expect(screen.getByText('Test tagline')).toBeInTheDocument();
  });

  it('renders email link', () => {
    render(<SiteFooter email='test@example.com' />);

    const emailLink = screen.getByRole('link', {name: 'test@example.com'});
    expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
  });

  it('renders address', () => {
    render(<SiteFooter address={{street: 'Test Street 1', city: 'Test City'}} />);

    expect(screen.getByText(/Test Street 1, Test City/)).toBeInTheDocument();
  });

  it('replaces the floating feedback button with a link-styled button in the last group', () => {
    render(<SiteFooter navigationGroups={mockNavigationGroups} />);

    const feedback = screen.getByRole('button', {name: 'Geef feedback'});
    expect(feedback.closest('nav')).toHaveAccessibleName('Support');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the feedback form from the footer', () => {
    render(<SiteFooter />);

    fireEvent.click(screen.getByRole('button', {name: 'Geef feedback'}));
    expect(screen.getByRole('dialog', {name: 'Geef ons je feedback'})).toBeInTheDocument();
  });

  it('renders copyright text', () => {
    render(<SiteFooter copyrightText='Test Copyright' />);

    expect(screen.getByText(/Test Copyright/)).toBeInTheDocument();
  });

  it('has correct accessibility roles', () => {
    render(<SiteFooter />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThan(0);
  });


  it('links to the cookie policy instead of showing a cookie notice', () => {
    render(<SiteFooter />);
    expect(screen.getByRole('link', {name: 'Cookiebeleid'})).toHaveAttribute('href', '/cookiebeleid');
    expect(screen.queryByRole('button', {name: /cookie/i})).not.toBeInTheDocument();
  });
});
