import type {Metadata} from 'next';

export const metadata: Metadata = {
	title: 'Nieuwe activiteit',
};

export default function NewActivityLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): React.ReactNode {
	return children;
}
