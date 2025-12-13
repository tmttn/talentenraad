import '@testing-library/jest-dom';

// Mock next/image
jest.mock('next/image', () => ({
	__esModule: true,
	default: ({priority, ...properties}: React.ImgHTMLAttributes<HTMLImageElement> & {priority?: boolean}) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img {...properties} data-priority={priority ? 'true' : undefined} alt={properties.alt ?? ''} />;
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
	Content: ({content, customComponents}: {content: unknown; customComponents: unknown[]}) => (
		<div data-testid="builder-content" data-content={JSON.stringify(content)} data-components={customComponents?.length ?? 0}>
			Builder Content
		</div>
	),
}));
