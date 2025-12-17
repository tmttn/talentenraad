import Link from 'next/link';
import {listContent} from '@/lib/builder-admin';
import type {Activity} from '@/lib/builder-types';
import {ActiviteitenTable} from './activiteiten-table';

export default async function ActiviteitenAdminPage() {
	const activities = await listContent('activiteit');

	return (
		<div>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-800'>Activiteiten</h1>
				<Link
					href='/admin/activiteiten/new'
					className='px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors'
				>
					Nieuwe activiteit
				</Link>
			</div>

			<ActiviteitenTable activities={activities} />
		</div>
	);
}
