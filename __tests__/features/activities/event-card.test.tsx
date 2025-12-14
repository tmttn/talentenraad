import {render, screen} from '@testing-library/react';
import {EventCardInfo} from '../../../app/features/activities/event-card';

const EventCard = EventCardInfo.component;

describe('EventCard', () => {
	const defaultProps = {
		title: 'Test Event',
		date: '15 maart 2025',
	};

	it('renders title and date', () => {
		render(<EventCard {...defaultProps} />);
		expect(screen.getByRole('heading', {name: 'Test Event'})).toBeInTheDocument();
		expect(screen.getByText('15 maart 2025')).toBeInTheDocument();
	});

	it('renders time when provided', () => {
		render(<EventCard {...defaultProps} time='14:00 - 18:00' />);
		expect(screen.getByText('14:00 - 18:00')).toBeInTheDocument();
	});

	it('renders location when provided', () => {
		render(<EventCard {...defaultProps} location='Het Talentenhuis' />);
		expect(screen.getByText('Het Talentenhuis')).toBeInTheDocument();
	});

	it('renders description when provided', () => {
		render(<EventCard {...defaultProps} description='Event description text' />);
		expect(screen.getByText('Event description text')).toBeInTheDocument();
	});

	it('renders without link when not provided', () => {
		const {container} = render(<EventCard {...defaultProps} />);
		expect(container.querySelector('a')).not.toBeInTheDocument();
	});

	it('wraps in link when link is provided', () => {
		render(<EventCard {...defaultProps} link='/events/test' />);
		const link = screen.getByRole('link', {name: /test event - meer info/i});
		expect(link).toHaveAttribute('href', '/events/test');
	});

	it('shows "Meer info" text when link is provided', () => {
		render(<EventCard {...defaultProps} link='/events/test' />);
		expect(screen.getByText('Meer info →')).toBeInTheDocument();
	});

	it('renders all optional fields together', () => {
		render(
			<EventCard
				{...defaultProps}
				time='10:00'
				location='School'
				description='Full event'
				link='/test'
			/>,
		);
		expect(screen.getByText('10:00')).toBeInTheDocument();
		expect(screen.getByText('School')).toBeInTheDocument();
		expect(screen.getByText('Full event')).toBeInTheDocument();
		expect(screen.getByRole('link')).toBeInTheDocument();
	});
});

describe('EventCardInfo', () => {
	it('exports correct component info', () => {
		expect(EventCardInfo.name).toBe('EventCard');
		expect(EventCardInfo.component).toBeDefined();
		expect(EventCardInfo.inputs).toBeInstanceOf(Array);
	});

	it('has required inputs for title and date', () => {
		const titleInput = EventCardInfo.inputs.find(i => i.name === 'title');
		const dateInput = EventCardInfo.inputs.find(i => i.name === 'date');
		expect(titleInput?.required).toBe(true);
		expect(dateInput?.required).toBe(true);
	});
});
