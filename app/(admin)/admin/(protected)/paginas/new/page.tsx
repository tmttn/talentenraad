'use client';

import {ContentForm, type FieldDefinition} from '@features/admin/content-form';

const pageFields: FieldDefinition[] = [
  {
    name: 'url',
    label: 'URL',
    type: 'text',
    required: true,
    placeholder: '/mijn-pagina',
    helpText: 'Begin met / (bijv. /over-ons)',
  },
  {
    name: 'title',
    label: 'Titel',
    type: 'text',
    required: true,
    placeholder: 'Titel van de pagina',
  },
  {
    name: 'seoTitle',
    label: 'SEO Titel',
    type: 'text',
    placeholder: 'Titel voor zoekmachines',
    helpText: 'Als leeg, wordt de normale titel gebruikt',
  },
  {
    name: 'seoDescription',
    label: 'SEO Beschrijving',
    type: 'textarea',
    placeholder: 'Beschrijving voor zoekmachines',
    helpText: 'Max 160 tekens voor optimale weergave',
  },
  {
    name: 'ogImage',
    label: 'Social Media Afbeelding',
    type: 'image',
    helpText: 'Afbeelding voor delen op social media',
  },
  {
    name: 'noIndex',
    label: 'Verbergen voor zoekmachines',
    type: 'boolean',
    placeholder: 'Niet indexeren door zoekmachines',
  },
];

export default function NewPagePage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    // Ensure URL starts with /
    const url = String(data.url);
    if (!url.startsWith('/')) {
      throw new Error('URL moet beginnen met /');
    }

    const response = await fetch('/api/admin/content/page', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        data: {
          ...data,
          url,
        },
        publish: true,
        name: String(data.title),
      }),
    });

    if (!response.ok) {
      const error = await response.json() as {error: string};
      throw new Error(error.error ?? 'Aanmaken mislukt');
    }
  };

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Nieuwe pagina</h1>
      <div className='max-w-2xl'>
        <ContentForm
          fields={pageFields}
          onSubmit={handleSubmit}
          submitLabel='Pagina aanmaken'
          successMessage='Pagina aangemaakt'
          cancelPath='/admin/paginas'
        />
      </div>
    </div>
  );
}
