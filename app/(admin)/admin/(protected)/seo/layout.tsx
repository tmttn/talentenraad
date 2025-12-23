import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'SEO Dashboard',
};

export default function SeoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return children;
}
