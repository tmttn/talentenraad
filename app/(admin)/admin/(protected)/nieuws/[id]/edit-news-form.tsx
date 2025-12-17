'use client';

import {ContentForm, type FieldDefinition} from '@/features/admin/content-form';
import type {NewsItem} from '@/lib/builder-types';

const newsFields: FieldDefinition[] = [
	{
		name: 'titel',
		label: 'Titel',
		type: 'text',
		required: true,
		placeholder: 'Titel van het artikel',
	},
	{
		name: 'datum',
		label: 'Datum',
		type: 'date',
		required: true,
	},
	{
		name: 'samenvatting',
		label: 'Samenvatting',
		type: 'textarea',
		required: true,
		placeholder: 'Korte samenvatting (max 200 tekens)',
		helpText: 'Deze tekst wordt getoond in de nieuwslijst',
	},
	{
		name: 'inhoud',
		label: 'Inhoud',
		type: 'richtext',
		placeholder: 'Volledige inhoud van het artikel...',
		helpText: 'HTML is toegestaan',
	},
	{
		name: 'afbeelding',
		label: 'Afbeelding URL',
		type: 'url',
		placeholder: 'https://...',
		helpText: 'Plak hier de URL van een afbeelding',
	},
	{
		name: 'vastgepind',
		label: 'Vastgepind',
		type: 'boolean',
		placeholder: 'Toon bovenaan de lijst',
	},
	{
		name: 'volgorde',
		label: 'Volgorde',
		type: 'number',
		placeholder: '0',
		helpText: 'Lagere nummers worden eerst getoond',
	},
];

type EditNewsFormProps = {
	newsItem: NewsItem;
};

export function EditNewsForm({newsItem}: EditNewsFormProps) {
	const handleSubmit = async (data: Record<string, unknown>) => {
		const response = await fetch(`/api/admin/content/nieuws/${newsItem.id}`, {
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				data,
				publish: true,
				name: String(data.titel),
			}),
		});

		if (!response.ok) {
			const error = await response.json() as {error: string};
			throw new Error(error.error ?? 'Opslaan mislukt');
		}
	};

	return (
		<ContentForm
			fields={newsFields}
			initialData={newsItem.data}
			onSubmit={handleSubmit}
			submitLabel='Wijzigingen opslaan'
			successMessage='Nieuwsbericht opgeslagen'
			cancelPath='/admin/nieuws'
		/>
	);
}
