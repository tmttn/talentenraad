import {render, screen} from '@testing-library/react';
import {SiteFooter, SiteFooterInfo} from '../../app/components/layout/site-footer';

// Mock icons
jest.mock('@components/ui', () => ({
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

		expect(screen.getByText('Navigatie')).toBeInTheDocument();
		expect(screen.getByText('Over Ons')).toBeInTheDocument();
		expect(screen.getByText('School')).toBeInTheDocument();
	});

	it('renders logo', () => {
		render(<SiteFooter />);

		const logo = screen.getByRole('img', {name: 'Talentenraad Logo'});
		expect(logo).toBeInTheDocument();
	});

	it('renders tagline', () => {
		render(<SiteFooter tagline="Test tagline" />);

		expect(screen.getByText('Test tagline')).toBeInTheDocument();
	});

	it('renders email link', () => {
		render(<SiteFooter email="test@example.com" />);

		const emailLink = screen.getByRole('link', {name: 'test@example.com'});
		expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com');
	});

	it('renders address', () => {
		render(<SiteFooter address={{street: 'Test Street 1', city: 'Test City'}} />);

		expect(screen.getByText('Test Street 1')).toBeInTheDocument();
		expect(screen.getByText('Test City')).toBeInTheDocument();
	});

	it('renders social links', () => {
		const socialLinks = [
			{platform: 'facebook' as const, url: 'https://facebook.com/test'},
			{platform: 'instagram' as const, url: 'https://instagram.com/test'},
		];
		render(<SiteFooter socialLinks={socialLinks} />);

		expect(screen.getByRole('link', {name: 'facebook (opent in nieuw venster)'})).toHaveAttribute('href', 'https://facebook.com/test');
		expect(screen.getByRole('link', {name: 'instagram (opent in nieuw venster)'})).toHaveAttribute('href', 'https://instagram.com/test');
	});

	it('renders copyright text', () => {
		render(<SiteFooter copyrightText="Test Copyright" />);

		expect(screen.getByText(/Test Copyright/)).toBeInTheDocument();
	});

	it('has correct accessibility roles', () => {
		render(<SiteFooter />);

		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		const navElements = screen.getAllByRole('navigation');
		expect(navElements.length).toBeGreaterThan(0);
	});

	it('has correct SiteFooterInfo export properties', () => {
		expect(SiteFooterInfo.name).toBe('SiteFooter');
		expect(SiteFooterInfo.component).toBeDefined();
		expect(SiteFooterInfo.inputs).toBeDefined();
		expect(SiteFooterInfo.inputs.length).toBeGreaterThan(0);
	});
});
