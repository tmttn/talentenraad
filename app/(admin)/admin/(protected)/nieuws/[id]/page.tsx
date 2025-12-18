import {notFound} from 'next/navigation';
import {getContent} from '@/lib/builder-admin';
import {SeoInsights} from '@components/admin/seo-insights';
import {EditNewsForm} from './edit-news-form';

type PageProps = {
	params: Promise<{id: string}>;
};

export default async function EditNewsPage({params}: PageProps) {
	const {id} = await params;
	const newsItem = await getContent('nieuws', id);

	if (!newsItem) {
		notFound();
	}

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Artikel bewerken</h1>
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				<div className='lg:col-span-2'>
					<EditNewsForm newsItem={newsItem} />
				</div>
				<div className='lg:col-span-1'>
					<SeoInsights
						title={newsItem.data.titel}
						description={newsItem.data.samenvatting}
						image={newsItem.data.afbeelding}
						content={newsItem.data.inhoud}
					/>
				</div>
			</div>
		</div>
	);
}
