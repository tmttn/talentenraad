'use client';

import {useState} from 'react';
import {ContentForm, type FieldDefinition} from '@/features/admin/content-form';
import {SeoInsights} from '@components/admin/seo-insights';
import {ExportButton} from '@/features/admin/export-button';
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

type EditNewsFormProps = {
	newsItem: NewsItem;
};

export function EditNewsForm({newsItem}: EditNewsFormProps) {
	const [formValues, setFormValues] = useState<Record<string, unknown>>(newsItem.data);

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
		<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
			<div className='lg:col-span-2'>
				<ContentForm
					fields={newsFields}
					initialData={newsItem.data}
					onSubmit={handleSubmit}
					onValuesChange={setFormValues}
					submitLabel='Wijzigingen opslaan'
					successMessage='Nieuwsbericht opgeslagen'
					cancelPath='/admin/nieuws'
				/>
			</div>
			<div className='lg:col-span-1'>
				<div className='sticky top-6 space-y-4'>
					<SeoInsights
						title={formValues.titel as string | undefined}
						description={formValues.samenvatting as string | undefined}
						image={formValues.afbeelding as string | undefined}
						content={formValues.inhoud as string | undefined}
					/>
					<div className='bg-white rounded-card shadow-base p-4'>
						<h3 className='text-sm font-semibold text-gray-800 mb-3'>Acties</h3>
						<ExportButton
							contentType='nieuws'
							itemId={newsItem.id}
							label='Exporteer nieuwsbericht'
							variant='secondary'
							className='w-full justify-center'
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
