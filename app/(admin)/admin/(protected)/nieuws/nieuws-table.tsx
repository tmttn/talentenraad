'use client';

import {useRouter} from 'next/navigation';
import {ContentTable} from '@/features/admin/content-table';
import type {NewsItem} from '@/lib/builder-types';

type NieuwsTableProps = {
	newsItems: NewsItem[];
};

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '')
		.replaceAll(/[^\s\w-]/g, '')
		.replaceAll(/\s+/g, '-');
}

export function NieuwsTable({newsItems}: NieuwsTableProps) {
	const router = useRouter();

	const handleDelete = async (item: NewsItem) => {
		const response = await fetch(`/api/admin/content/nieuws/${item.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Verwijderen mislukt');
		}

		router.refresh();
	};

	const columns = [
		{
			key: 'data.titel',
			label: 'Titel',
			render: (item: NewsItem) => (
				<span className='font-medium text-gray-900'>{item.data.titel}</span>
			),
		},
		{
			key: 'data.datum',
			label: 'Datum',
			render: (item: NewsItem) => {
				const date = new Date(item.data.datum);
				return date.toLocaleDateString('nl-BE', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				});
			},
		},
		{
			key: 'data.samenvatting',
			label: 'Samenvatting',
			render: (item: NewsItem) => (
				<span className='text-gray-600 text-sm line-clamp-1 max-w-xs'>
					{item.data.samenvatting}
				</span>
			),
		},
		{
			key: 'data.vastgepind',
			label: 'Vastgepind',
			render: (item: NewsItem) => (
				<span className={item.data.vastgepind ? 'text-primary' : 'text-gray-400'}>
					{item.data.vastgepind ? '&#9733;' : '&#9734;'}
				</span>
			),
		},
		{
			key: 'published',
			label: 'Status',
			render: (item: NewsItem) => (
				<span className={`px-2 py-1 text-xs font-medium rounded ${
					item.published === 'published'
						? 'bg-green-100 text-green-800'
						: 'bg-yellow-100 text-yellow-800'
				}`}>
					{item.published === 'published' ? 'Gepubliceerd' : 'Concept'}
				</span>
			),
		},
	];

	return (
		<ContentTable
			items={newsItems}
			columns={columns}
			editPath={item => `/admin/nieuws/${item.id}`}
			viewPath={item => `/nieuws/${generateSlug(item.data.titel)}`}
			onDelete={handleDelete}
			emptyMessage='Geen nieuws gevonden'
		/>
	);
}
