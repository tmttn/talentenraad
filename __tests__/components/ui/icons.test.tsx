import {render, screen} from '@testing-library/react';
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookmarkIcon,
	CalendarIcon,
	CheckIcon,
	ChevronRightIcon,
	ClockIcon,
	EmailIcon,
	GiftIcon,
	HeartIcon,
	LocationIcon,
	MoneyIcon,
	NewsIcon,
	QuestionIcon,
	StarIcon,
	UsersIcon,
	XIcon,
} from '../../../app/components/ui/icons';

const icons = [
	{name: 'CalendarIcon', Component: CalendarIcon},
	{name: 'ClockIcon', Component: ClockIcon},
	{name: 'LocationIcon', Component: LocationIcon},
	{name: 'ArrowRightIcon', Component: ArrowRightIcon},
	{name: 'ArrowLeftIcon', Component: ArrowLeftIcon},
	{name: 'ChevronRightIcon', Component: ChevronRightIcon},
	{name: 'UsersIcon', Component: UsersIcon},
	{name: 'HeartIcon', Component: HeartIcon},
	{name: 'StarIcon', Component: StarIcon},
	{name: 'EmailIcon', Component: EmailIcon},
	{name: 'QuestionIcon', Component: QuestionIcon},
	{name: 'NewsIcon', Component: NewsIcon},
	{name: 'GiftIcon', Component: GiftIcon},
	{name: 'MoneyIcon', Component: MoneyIcon},
	{name: 'CheckIcon', Component: CheckIcon},
	{name: 'XIcon', Component: XIcon},
];

describe('Icon Components', () => {
	describe.each(icons)('$name', ({Component}) => {
		it('renders with default size (md)', () => {
			const {container} = render(<Component />);
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
			expect(svg).toHaveClass('h-5', 'w-5');
		});

		it('renders with xs size', () => {
			const {container} = render(<Component size='xs' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-3', 'w-3');
		});

		it('renders with sm size', () => {
			const {container} = render(<Component size='sm' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-4', 'w-4');
		});

		it('renders with lg size', () => {
			const {container} = render(<Component size='lg' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-6', 'w-6');
		});

		it('renders with xl size', () => {
			const {container} = render(<Component size='xl' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-8', 'w-8');
		});

		it('accepts custom className', () => {
			const {container} = render(<Component className='custom-class' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('custom-class');
		});

		it('has aria-hidden attribute', () => {
			const {container} = render(<Component />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('BookmarkIcon', () => {
		it('renders outlined version by default', () => {
			const {container} = render(<BookmarkIcon />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('fill', 'none');
			expect(svg).toHaveAttribute('stroke', 'currentColor');
		});

		it('renders filled version when filled prop is true', () => {
			const {container} = render(<BookmarkIcon filled />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('fill', 'currentColor');
			expect(svg).not.toHaveAttribute('stroke');
		});

		it('renders with different sizes when filled', () => {
			const {container} = render(<BookmarkIcon filled size='lg' />);
			const svg = container.querySelector('svg');
			expect(svg).toHaveClass('h-6', 'w-6');
		});
	});
});
