import {render, screen} from '@testing-library/react';
import {NewsCardInfo} from '../../../app/features/news/news-card';

// Mock the UI components
jest.mock('../../../app/components/ui', () => ({
	linkStyles: '.animated-link { transition: all 0.2s; }',
	ClockIcon: () => <svg data-testid='icon-clock' />,
	ArrowRightIcon: () => <svg data-testid='icon-arrow-right' />,
}));

const NewsCard = NewsCardInfo.component;

describe('NewsCard', () => {
	const defaultProps = {
		title: 'Test News',
		date: '1 januari 2025',
	};

	it('renders title and date', () => {
		render(<NewsCard {...defaultProps} />);
		expect(screen.getByRole('heading', {name: 'Test News'})).toBeInTheDocument();
		expect(screen.getByText('1 januari 2025')).toBeInTheDocument();
	});

	it('renders excerpt when provided', () => {
		render(<NewsCard {...defaultProps} excerpt='News excerpt text' />);
		expect(screen.getByText('News excerpt text')).toBeInTheDocument();
	});

	it('renders category when image and category provided', () => {
		render(<NewsCard {...defaultProps} category='Nieuws' image='/test.jpg' />);
		expect(screen.getByText('Nieuws')).toBeInTheDocument();
	});

	it('does not render category without image', () => {
		render(<NewsCard {...defaultProps} category='Nieuws' />);
		expect(screen.queryByText('Nieuws')).not.toBeInTheDocument();
	});

	it('renders without link when not provided', () => {
		const {container} = render(<NewsCard {...defaultProps} />);
		const wrapper = container.firstChild;
		expect(wrapper?.nodeName).not.toBe('A');
	});

	it('wraps in link when link is provided', () => {
		render(<NewsCard {...defaultProps} link='/news/test' />);
		const link = screen.getByRole('link', {name: /test news - lees meer/i});
		expect(link).toHaveAttribute('href', '/news/test');
	});

	it('shows "Lees meer" text when link is provided', () => {
		render(<NewsCard {...defaultProps} link='/news/test' />);
		expect(screen.getByText('Lees meer')).toBeInTheDocument();
	});

	it('does not show "Lees meer" when no link provided', () => {
		render(<NewsCard {...defaultProps} />);
		expect(screen.queryByText('Lees meer')).not.toBeInTheDocument();
	});

	it('renders all optional fields together', () => {
		render(
			<NewsCard
				{...defaultProps}
				excerpt='Full news excerpt'
				category='Activiteit'
				image='/test.jpg'
				link='/news/full'
			/>,
		);
		expect(screen.getByText('Full news excerpt')).toBeInTheDocument();
		expect(screen.getByText('Activiteit')).toBeInTheDocument();
		expect(screen.getByRole('link')).toBeInTheDocument();
	});

	it('has accessible focus styles on link', () => {
		render(<NewsCard {...defaultProps} link='/test' />);
		const link = screen.getByRole('link');
		expect(link).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-focus');
	});
});

describe('NewsCardInfo', () => {
	it('exports correct component info', () => {
		expect(NewsCardInfo.name).toBe('NewsCard');
		expect(NewsCardInfo.component).toBeDefined();
		expect(NewsCardInfo.inputs).toBeInstanceOf(Array);
	});

	it('has required inputs for title and date', () => {
		const titleInput = NewsCardInfo.inputs.find(i => i.name === 'title');
		const dateInput = NewsCardInfo.inputs.find(i => i.name === 'date');
		expect(titleInput?.required).toBe(true);
		expect(dateInput?.required).toBe(true);
	});

	it('has category enum options', () => {
		const categoryInput = NewsCardInfo.inputs.find(i => i.name === 'category');
		expect(categoryInput?.enum).toContain('Nieuws');
		expect(categoryInput?.enum).toContain('Activiteit');
	});
});
