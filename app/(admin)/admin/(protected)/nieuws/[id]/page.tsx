import {notFound} from 'next/navigation';
import {getContent} from '@/lib/builder-admin';
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
			<EditNewsForm newsItem={newsItem} />
		</div>
	);
}
