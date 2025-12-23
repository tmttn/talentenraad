'use client';

import {ContentForm, type FieldDefinition} from '@features/admin/content-form';

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

export default function NewNewsPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/admin/content/nieuws', {
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
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Nieuw artikel</h1>
      <div className='max-w-2xl'>
        <ContentForm
          fields={newsFields}
          onSubmit={handleSubmit}
          submitLabel='Artikel aanmaken'
          successMessage='Nieuwsbericht aangemaakt'
          cancelPath='/admin/nieuws'
        />
      </div>
    </div>
  );
}
