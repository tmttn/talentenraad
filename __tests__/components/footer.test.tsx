import {render, screen} from '@testing-library/react';
import {FooterInfo} from '../../app/components/footer';

const Footer = FooterInfo.component;

describe('Footer', () => {
	const mockNavigation = {
		value: {
			data: {
				groups: [
					{
						title: 'Company',
						navigationlinks: {
							links: [
								{url: '/about', text: 'About Us'},
								{url: '/careers', text: 'Careers'},
							],
						},
					},
					{
						title: 'Support',
						navigationlinks: {
							links: [
								{url: '/help', text: 'Help Center'},
								{url: '/contact', text: 'Contact'},
							],
						},
					},
				],
			},
		},
	};

	it('renders footer with navigation groups', () => {
		render(<Footer navigation={mockNavigation} />);

		expect(screen.getByText('Company')).toBeInTheDocument();
		expect(screen.getByText('Support')).toBeInTheDocument();
	});

	it('renders navigation links within groups', () => {
		render(<Footer navigation={mockNavigation} />);

		expect(screen.getByRole('link', {name: 'About Us'})).toHaveAttribute('href', '/about');
		expect(screen.getByRole('link', {name: 'Careers'})).toHaveAttribute('href', '/careers');
		expect(screen.getByRole('link', {name: 'Help Center'})).toHaveAttribute('href', '/help');
		expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute('href', '/contact');
	});

	it('renders social media section', () => {
		render(<Footer navigation={mockNavigation} />);

		expect(screen.getByText('Sociale media')).toBeInTheDocument();
		const socialLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href') === '/');
		expect(socialLinks.length).toBeGreaterThan(0);
	});

	it('renders with empty navigation when groups are undefined', () => {
		const emptyNavigation = {value: {data: {groups: undefined as never}}};
		render(<Footer navigation={emptyNavigation} />);

		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('renders with empty navigation when value is undefined', () => {
		const undefinedNavigation = {value: undefined as never};
		render(<Footer navigation={undefinedNavigation} />);

		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('renders group without links when navigationlinks is undefined', () => {
		const navigationWithEmptyLinks = {
			value: {
				data: {
					groups: [
						{
							title: 'Empty Group',
							navigationlinks: undefined as never,
						},
					],
				},
			},
		};
		render(<Footer navigation={navigationWithEmptyLinks} />);

		expect(screen.getByText('Empty Group')).toBeInTheDocument();
	});

	it('has correct accessibility roles', () => {
		render(<Footer navigation={mockNavigation} />);

		expect(screen.getByRole('contentinfo')).toBeInTheDocument();
		const navElements = screen.getAllByRole('navigation');
		expect(navElements.length).toBeGreaterThan(0);
	});

	it('has correct FooterInfo export properties', () => {
		expect(FooterInfo.name).toBe('Footer');
		expect(FooterInfo.component).toBeDefined();
		expect(FooterInfo.inputs).toHaveLength(1);
		expect(FooterInfo.inputs[0]).toEqual({
			name: 'navigation',
			type: 'reference',
			model: 'grouped-navigation-list',
			required: true,
		});
	});
});
