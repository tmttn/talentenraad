import {Suspense} from 'react';
import Link from 'next/link';
import {listContent} from '@/lib/builder-admin';
import {TableSkeleton} from '@components/skeletons';
import {NieuwsTable} from './nieuws-table';

async function NieuwsTableLoader() {
	const newsItems = await listContent('nieuws');
	return <NieuwsTable newsItems={newsItems} />;
}

export default function NieuwsAdminPage() {
	return (
		<div>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Nieuws</h1>
				<Link
					href='/admin/nieuws/new'
					className='px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors'
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
