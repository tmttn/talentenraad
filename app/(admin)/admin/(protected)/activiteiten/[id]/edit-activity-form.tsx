'use client';

import {useState} from 'react';
import {ContentForm, type FieldDefinition} from '@/features/admin/content-form';
import {SeoInsights} from '@components/admin/seo-insights';
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

type EditActivityFormProps = {
	activity: Activity;
};

export function EditActivityForm({activity}: EditActivityFormProps) {
	const [formValues, setFormValues] = useState<Record<string, unknown>>(activity.data);

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
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2'>
				<ContentForm
					fields={activityFields}
					initialData={activity.data}
					onSubmit={handleSubmit}
					onValuesChange={setFormValues}
					submitLabel='Wijzigingen opslaan'
					successMessage='Activiteit opgeslagen'
					cancelPath='/admin/activiteiten'
				/>
			</div>
			<div className='lg:col-span-1'>
				<div className='sticky top-6'>
					<SeoInsights
						title={formValues.titel as string | undefined}
						description={formValues.samenvatting as string | undefined}
						image={formValues.afbeelding as string | undefined}
						content={formValues.inhoud as string | undefined}
					/>
				</div>
			</div>
		</div>
	);
}
