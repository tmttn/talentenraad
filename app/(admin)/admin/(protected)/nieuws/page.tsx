import Link from 'next/link';
import {listContent} from '@/lib/builder-admin';
import {NieuwsTable} from './nieuws-table';

export default async function NieuwsAdminPage() {
	const newsItems = await listContent('nieuws');

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

			<NieuwsTable newsItems={newsItems} />
		</div>
	);
}
