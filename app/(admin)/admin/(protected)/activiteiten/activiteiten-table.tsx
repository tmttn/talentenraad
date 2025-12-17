'use client';

import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Star} from 'lucide-react';
import {ContentTable} from '@/features/admin/content-table';
import type {Activity} from '@/lib/builder-types';

type ActiviteitenTableProps = {
	activities: Activity[];
};

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036F]/g, '')
		.replaceAll(/[^\s\w-]/g, '')
		.replaceAll(/\s+/g, '-');
}

const categoryLabels: Record<string, string> = {
	kalender: 'Kalender',
	activiteit: 'Activiteit',
	nieuws: 'Nieuws',
	feest: 'Feest',
};

export function ActiviteitenTable({activities}: ActiviteitenTableProps) {
	const router = useRouter();

	const handleDelete = async (item: Activity) => {
		const response = await fetch(`/api/admin/content/activiteit/${item.id}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			toast.error('Verwijderen mislukt');
			throw new Error('Verwijderen mislukt');
		}

		toast.success('Activiteit verwijderd');
		router.refresh();
	};

	const columns = [
		{
			key: 'data.titel',
			label: 'Titel',
			isTitle: true,
			render: (item: Activity) => item.data.titel,
		},
		{
			key: 'data.datum',
			label: 'Datum',
			render: (item: Activity) => {
				const date = new Date(item.data.datum);
				return date.toLocaleDateString('nl-BE', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				});
			},
		},
		{
			key: 'data.categorie',
			label: 'Categorie',
			render: (item: Activity) => (
				<span className='px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded'>
					{categoryLabels[item.data.categorie] ?? item.data.categorie}
				</span>
			),
		},
		{
			key: 'data.vastgepind',
			label: 'Vastgepind',
			render: (item: Activity) => (
				<Star
					className={`w-5 h-5 ${item.data.vastgepind ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
				/>
			),
		},
		{
			key: 'published',
			label: 'Status',
			render: (item: Activity) => (
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
			items={activities}
			columns={columns}
			editPath={item => `/admin/activiteiten/${item.id}`}
			viewPath={item => `/activiteiten/${generateSlug(item.data.titel)}`}
			onDelete={handleDelete}
			emptyMessage='Geen activiteiten gevonden'
		/>
	);
}
