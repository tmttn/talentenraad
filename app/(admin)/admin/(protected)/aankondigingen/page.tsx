import {listContent} from '@/lib/builder-admin';
import {AankondigingenManager} from './aankondigingen-manager';

export default async function AankondigingenAdminPage() {
	const announcements = await listContent('aankondiging');

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Aankondigingen</h1>
			<AankondigingenManager announcements={announcements} />
		</div>
	);
}
