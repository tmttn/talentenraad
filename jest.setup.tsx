import '@testing-library/jest-dom';

// Mock SVG icons module - Next.js default SVG handling returns objects, not components
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('@/app/components/icons/icons', () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const React = require('react');
	const createMockIcon = (name: string) =>
		function MockIcon(props: Record<string, unknown>) {
			return React.createElement('svg', {'data-testid': `icon-${name}`, ...props});
		};

	return {
		__esModule: true,
		ArrowRightIcon: createMockIcon('arrow-right'),
		ChevronDownIcon: createMockIcon('chevron-down'),
		ChevronRightIcon: createMockIcon('chevron-right'),
		EmailIcon: createMockIcon('email'),
		PhoneIcon: createMockIcon('phone'),
		ChatIcon: createMockIcon('chat'),
		SendIcon: createMockIcon('send'),
		CalendarIcon: createMockIcon('calendar'),
		ClockIcon: createMockIcon('clock'),
		LocationIcon: createMockIcon('location'),
		UsersIcon: createMockIcon('users'),
		UserIcon: createMockIcon('user'),
		SuccessIcon: createMockIcon('success'),
		ErrorIcon: createMockIcon('error'),
		InfoIcon: createMockIcon('info'),
		WarningIcon: createMockIcon('warning'),
		QuestionIcon: createMockIcon('question'),
		HeartIcon: createMockIcon('heart'),
		StarIcon: createMockIcon('star'),
		GiftIcon: createMockIcon('gift'),
		MoneyIcon: createMockIcon('money'),
		SchoolIcon: createMockIcon('school'),
		NewsIcon: createMockIcon('news'),
		PinnedIcon: createMockIcon('pinned'),
		SpinnerIcon: createMockIcon('spinner'),
		FacebookIcon: createMockIcon('facebook'),
		InstagramIcon: createMockIcon('instagram'),
		arrowRightPath: 'M17 8l4 4m0 0l-4 4m4-4H3',
		questionPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2...',
	};
});

// Suppress specific React console errors for known test limitations
const originalConsoleError = console.error;
console.error = (...arguments_) => {
	const message = String(arguments_[0]);
	// Suppress html-in-div warnings (layout tests) and fill attribute warnings (next/image mock)
	if (message.includes('cannot be a child of')
		|| message.includes('non-boolean attribute')) {
		return;
	}

	originalConsoleError(...arguments_);
};

// Mock next/image
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({priority, fill, ...properties}: React.ImgHTMLAttributes<HTMLImageElement> & {priority?: boolean; fill?: boolean}) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img {...properties} data-priority={priority ? 'true' : undefined} data-fill={fill ? 'true' : undefined} alt={properties.alt ?? ''} />;
	},
}));

// Mock next/link
jest.mock('next/link', () => ({
	__esModule: true,
	default: ({children, href, ...properties}: {children: React.ReactNode; href: string}) => (
		<a href={href} {...properties}>{children}</a>
	),
}));

// Mock Builder.io SDK
jest.mock('@builder.io/sdk-react-nextjs', () => ({
	fetchOneEntry: jest.fn(),
	isPreviewing: jest.fn(),
	isEditing: jest.fn(),
	getBuilderSearchParams: jest.fn((params: Record<string, string>) => params),
	Content: ({content, customComponents}: {content: unknown; customComponents: unknown[]}) => (
		<div data-testid="builder-content" data-content={JSON.stringify(content)} data-components={customComponents?.length ?? 0}>
			Builder Content
		</div>
	),
}));
