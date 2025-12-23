'use client';

import {ContentForm, type FieldDefinition} from '@features/admin/content-form';

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
		name: 'samenvatting',
		label: 'Samenvatting',
		type: 'textarea',
		placeholder: 'Korte samenvatting (max 200 tekens)',
		helpText: 'Deze tekst wordt getoond in de activiteitenlijst en voor SEO',
	},
	{
		name: 'inhoud',
		label: 'Inhoud',
		type: 'richtext',
		placeholder: 'Volledige inhoud van de activiteit...',
		helpText: 'HTML is toegestaan',
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
		label: 'Afbeelding',
		type: 'image',
		helpText: 'Kies een afbeelding uit de bibliotheek',
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

export default function NewActivityPage() {
	const handleSubmit = async (data: Record<string, unknown>) => {
		const response = await fetch('/api/admin/content/activiteit', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				data,
				publish: true,
				name: String(data.titel),
			}),
		});

		if (!response.ok) {
			const error = await response.json() as {error: string};
			throw new Error(error.error ?? 'Aanmaken mislukt');
		}
	};

	return (
		<div>
			<h1 className='text-3xl font-bold text-gray-800 mb-8'>Nieuwe activiteit</h1>
			<div className='max-w-2xl'>
				<ContentForm
					fields={activityFields}
					onSubmit={handleSubmit}
					submitLabel='Activiteit aanmaken'
					successMessage='Activiteit aangemaakt'
					cancelPath='/admin/activiteiten'
				/>
			</div>
		</div>
	);
}
