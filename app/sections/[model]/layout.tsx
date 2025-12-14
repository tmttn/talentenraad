import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Section Preview - Talentenraad',
	description: 'Builder.io section preview',
	robots: 'noindex, nofollow',
};

/**
 * Section Preview Layout
 *
 * This layout provides a minimal wrapper for section previews.
 * It excludes the main site header, footer, and navigation
 * so Builder.io can preview sections in isolation.
 */
export default function SectionPreviewLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='section-preview bg-white'>
			{children}
		</div>
	);
}
