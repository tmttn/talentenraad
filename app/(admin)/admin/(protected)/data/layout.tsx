import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Data Beheer',
};

export default function DataLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return children;
}
