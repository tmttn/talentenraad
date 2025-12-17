'use client';

import {ContentForm, type FieldDefinition} from '@/features/admin/content-form';
import type {Activity} from '@/lib/builder-types';

const activityFields: FieldDefinition[] = [
	{
		name: 'titel',
		label: 'Titel',
		type: 'text',
		required: true,
		placeholder: 'Naam van de activiteit',
	},
	{
		name: 'datum',
		label: 'Datum',
		type: 'date',
		required: true,
	},
	{
		name: 'tijd',
		label: 'Tijd',
		type: 'text',
		placeholder: 'bijv. 14:00 - 17:00',
	},
	{
		name: 'locatie',
		label: 'Locatie',
		type: 'text',
		placeholder: 'Waar vindt de activiteit plaats?',
	},
	{
		name: 'beschrijving',
		label: 'Beschrijving',
		type: 'richtext',
		placeholder: 'Beschrijving van de activiteit',
	},
	{
		name: 'categorie',
		label: 'Categorie',
		type: 'select',
		required: true,
		options: [
			{value: 'kalender', label: 'Kalender'},
			{value: 'activiteit', label: 'Activiteit'},
			{value: 'nieuws', label: 'Nieuws'},
			{value: 'feest', label: 'Feest'},
		],
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

type EditActivityFormProps = {
	activity: Activity;
};

export function EditActivityForm({activity}: EditActivityFormProps) {
	const handleSubmit = async (data: Record<string, unknown>) => {
		const response = await fetch(`/api/admin/content/activiteit/${activity.id}`, {
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
			fields={activityFields}
			initialData={activity.data}
			onSubmit={handleSubmit}
			submitLabel='Wijzigingen opslaan'
			successMessage='Activiteit opgeslagen'
			cancelPath='/admin/activiteiten'
		/>
	);
}
