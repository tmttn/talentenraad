import '@testing-library/jest-dom';

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

// Mock next/navigation
jest.mock('next/navigation', () => ({
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => '/',
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		refresh: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
		prefetch: jest.fn(),
	}),
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

// Mock feature flags - all enabled by default for tests
const mockFlagValues = {
	adminSubmissions: true,
	adminActivities: true,
	adminNews: true,
	adminAnnouncements: true,
	adminNotifications: true,
	adminAuditLogs: true,
	seasonalDecorations: false,
	cookieBanner: true,
	contactForm: true,
	contactFormPhone: true,
	contactFormSubject: true,
	announcementBanner: true,
	heroBanner: true,
	ctaBanner: true,
	activitiesList: true,
	activitiesCalendar: true,
	activitiesArchive: true,
	newsList: true,
	faqSection: true,
	teamGrid: true,
	photoGallery: true,
	newsletterSignup: true,
	serviceWorker: true,
	offlinePage: true,
	pushNotifications: true,
	installPrompt: true,
};

jest.mock('@/lib/flags-client', () => ({
	useFlag: (key: string) => mockFlagValues[key as keyof typeof mockFlagValues] ?? true,
	useFlags: () => mockFlagValues,
	FlagsProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@/lib/flags', () => ({
	getFlag: async (key: string) => mockFlagValues[key as keyof typeof mockFlagValues] ?? true,
	getAllFlags: async () => mockFlagValues,
	seasonalDecorations: async () => false,
	cookieBanner: async () => true,
}));
