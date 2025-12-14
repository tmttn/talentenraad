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
