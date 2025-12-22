import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Nieuw artikel',
};

export default function NewNewsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): React.ReactNode {
	return children;
}
