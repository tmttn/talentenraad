import {render} from '@testing-library/react';
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	BookmarkIcon,
	CalendarIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	ClockIcon,
	EmailIcon,
	ErrorIcon,
	FacebookIcon,
	GiftIcon,
	HeartIcon,
	InfoIcon,
	InstagramIcon,
	LocationIcon,
	MoneyIcon,
	NewsIcon,
	PhoneIcon,
	PinnedIcon,
	QuestionIcon,
	SchoolIcon,
	SendIcon,
	SpinnerIcon,
	StarIcon,
	SuccessIcon,
	UserIcon,
	UsersIcon,
	WarningIcon,
	XIcon,
	arrowRightPath,
	questionPath,
} from '@components/ui/icons';

const icons = [
	{name: 'ArrowLeftIcon', Component: ArrowLeftIcon},
	{name: 'ArrowRightIcon', Component: ArrowRightIcon},
	{name: 'BookmarkIcon', Component: BookmarkIcon},
	{name: 'CalendarIcon', Component: CalendarIcon},
	{name: 'CheckIcon', Component: CheckIcon},
	{name: 'ChevronDownIcon', Component: ChevronDownIcon},
	{name: 'ChevronRightIcon', Component: ChevronRightIcon},
	{name: 'ClockIcon', Component: ClockIcon},
	{name: 'EmailIcon', Component: EmailIcon},
	{name: 'ErrorIcon', Component: ErrorIcon},
	{name: 'FacebookIcon', Component: FacebookIcon},
	{name: 'GiftIcon', Component: GiftIcon},
	{name: 'HeartIcon', Component: HeartIcon},
	{name: 'InfoIcon', Component: InfoIcon},
	{name: 'InstagramIcon', Component: InstagramIcon},
	{name: 'LocationIcon', Component: LocationIcon},
	{name: 'MoneyIcon', Component: MoneyIcon},
	{name: 'NewsIcon', Component: NewsIcon},
	{name: 'PhoneIcon', Component: PhoneIcon},
	{name: 'PinnedIcon', Component: PinnedIcon},
	{name: 'QuestionIcon', Component: QuestionIcon},
	{name: 'SchoolIcon', Component: SchoolIcon},
	{name: 'SendIcon', Component: SendIcon},
	{name: 'SpinnerIcon', Component: SpinnerIcon},
	{name: 'StarIcon', Component: StarIcon},
	{name: 'SuccessIcon', Component: SuccessIcon},
	{name: 'UserIcon', Component: UserIcon},
	{name: 'UsersIcon', Component: UsersIcon},
	{name: 'WarningIcon', Component: WarningIcon},
	{name: 'XIcon', Component: XIcon},
];

describe('Icon Components', () => {
	describe.each(icons)('$name', ({Component}) => {
		it('renders an svg element', () => {
			const {container} = render(<Component />);
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('passes through className prop', () => {
			const {container} = render(<Component className='custom-class' />);
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});

		it('accepts size prop', () => {
			const {container} = render(<Component size='lg' />);
			const svg = container.querySelector('svg');
			expect(svg).toBeInTheDocument();
		});
	});

	describe('Path exports', () => {
		it('exports arrowRightPath', () => {
			expect(arrowRightPath).toBeDefined();
			expect(typeof arrowRightPath).toBe('string');
		});

		it('exports questionPath', () => {
			expect(questionPath).toBeDefined();
			expect(typeof questionPath).toBe('string');
		});
	});
});
