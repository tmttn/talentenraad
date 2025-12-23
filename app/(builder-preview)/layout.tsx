import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Section Preview - Talentenraad',
  description: 'Builder.io section preview',
  robots: 'noindex, nofollow',
};

/**
 * Builder Preview Layout
 *
 * Minimal layout for Builder.io section previews.
 * No header, footer, or site navigation - just the section content.
 */
export default function BuilderPreviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='builder-preview min-h-screen'>
      {children}
    </div>
  );
}
