import {notFound} from 'next/navigation';
import {getContent} from '@/lib/builder-admin';
import {SeoInsights} from '@components/admin/seo-insights';
import {EditActivityForm} from './edit-activity-form';

type PageProps = {
	params: Promise<{id: string}>;
};

export default async function EditActivityPage({params}: PageProps) {
	const {id} = await params;
	const activity = await getContent('activiteit', id);

	if (!activity) {
		notFound();
	}

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Activiteit bewerken</h1>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2'>
					<EditActivityForm activity={activity} />
				</div>
				<div className='lg:col-span-1'>
					<SeoInsights
						title={activity.data.titel}
						description={activity.data.samenvatting}
						image={activity.data.afbeelding}
					/>
				</div>
			</div>
		</div>
	);
}
