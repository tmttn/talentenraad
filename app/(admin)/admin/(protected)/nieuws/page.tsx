import type {Metadata} from 'next';
import {Suspense} from 'react';
import Link from 'next/link';
import {listContent} from '@lib/builder-admin';
import {getClapsForContentType} from '@lib/claps-admin';
import {TableSkeleton} from '@components/skeletons';
import {NieuwsTable} from './nieuws-table';

export const metadata: Metadata = {
	title: 'Nieuws',
};

async function NieuwsTableLoader() {
	const [newsItems, clapsMap] = await Promise.all([
		listContent('nieuws'),
		getClapsForContentType('nieuws'),
	]);
	// Convert Map to plain object for serialization
	const clapsData: Record<string, number> = Object.fromEntries(clapsMap);
	return <NieuwsTable newsItems={newsItems} clapsData={clapsData} />;
}

export default function NieuwsAdminPage() {
	return (
		<div>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Nieuws</h1>
				<Link
					href='/admin/nieuws/new'
					className='px-6 py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors'
				>
					Nieuw artikel
				</Link>
			</div>

			<Suspense fallback={<TableSkeleton rows={8} />}>
				<NieuwsTableLoader />
			</Suspense>
		</div>
	);
}
