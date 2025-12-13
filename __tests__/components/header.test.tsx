import {render, screen} from '@testing-library/react';
import {HeaderInfo} from '../../app/components/header';

const Header = HeaderInfo.component;

describe('Header', () => {
	const mockNavigation = {
		value: {
			data: {
				links: [
					{url: '/', text: 'Home'},
					{url: '/about', text: 'About'},
					{url: '/contact', text: 'Contact'},
				],
			},
		},
	};

	it('renders the logo image', () => {
		render(<Header navigation={mockNavigation} />);

		const logo = screen.getByRole('img', {name: 'Logo'});
		expect(logo).toBeInTheDocument();
		expect(logo).toHaveAttribute('src', '/Logo.jpeg');
	});

	it('renders navigation links', () => {
		render(<Header navigation={mockNavigation} />);

		expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute('href', '/about');
		expect(screen.getByRole('link', {name: 'Contact'})).toHaveAttribute('href', '/contact');
	});

	it('renders with empty navigation when links are undefined', () => {
		const emptyNavigation = {value: {data: {links: undefined as never}}};
		render(<Header navigation={emptyNavigation} />);

		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(screen.queryByRole('link')).not.toBeInTheDocument();
	});

	it('renders with empty navigation when value is undefined', () => {
		const undefinedNavigation = {value: undefined as never};
		render(<Header navigation={undefinedNavigation} />);

		expect(screen.getByRole('banner')).toBeInTheDocument();
	});

	it('has correct accessibility roles', () => {
		render(<Header navigation={mockNavigation} />);

		expect(screen.getByRole('banner')).toBeInTheDocument();
		expect(screen.getByRole('navigation')).toBeInTheDocument();
	});

	it('has correct HeaderInfo export properties', () => {
		expect(HeaderInfo.name).toBe('Header');
		expect(HeaderInfo.component).toBeDefined();
		expect(HeaderInfo.inputs).toHaveLength(1);
		expect(HeaderInfo.inputs[0]).toEqual({
			name: 'navigation',
			type: 'reference',
			model: 'navigation-list',
			required: true,
		});
	});
});
