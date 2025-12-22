import {Suspense} from 'react';
import Link from 'next/link';
import {listContent} from '@/lib/builder-admin';
import {getClapsForContentType} from '@/lib/claps-admin';
import {TableSkeleton} from '@components/skeletons';
import {ActiviteitenTable} from './activiteiten-table';

async function ActiviteitenTableLoader() {
	const [activities, clapsMap] = await Promise.all([
		listContent('activiteit'),
		getClapsForContentType('activiteit'),
	]);
	// Convert Map to plain object for serialization
	const clapsData: Record<string, number> = Object.fromEntries(clapsMap);
	return <ActiviteitenTable activities={activities} clapsData={clapsData} />;
}

export default function ActiviteitenAdminPage() {
	return (
		<div>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Activiteiten</h1>
				<Link
					href='/admin/activiteiten/new'
					className='px-6 py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors'
				>
					Nieuwe activiteit
				</Link>
			</div>

			<Suspense fallback={<TableSkeleton rows={8} />}>
				<ActiviteitenTableLoader />
			</Suspense>
		</div>
	);
}
