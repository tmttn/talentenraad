'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ExternalLink} from 'lucide-react';
import {ContentForm, type FieldDefinition} from '@features/admin/content-form';
import {SeoInsights} from '@components/admin/seo-insights';
import {type Page, PROTECTED_PAGE_URLS} from '@lib/builder-types';

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

type EditPageFormProps = {
  pageItem: Page;
};

export function EditPageForm({pageItem}: EditPageFormProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(pageItem.data);
  const isProtected = PROTECTED_PAGE_URLS.includes(pageItem.data?.url ?? '');

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Ensure URL starts with /
    const url = String(data.url);
    if (!url.startsWith('/')) {
      throw new Error('URL moet beginnen met /');
    }

    // Prevent changing URL of protected pages
    if (isProtected && url !== pageItem.data?.url) {
      throw new Error('De URL van een beschermde pagina kan niet worden gewijzigd');
    }

    const response = await fetch(`/api/admin/content/page/${pageItem.id}`, {
      method: 'PUT',
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
      throw new Error(error.error ?? 'Opslaan mislukt');
    }
  };

  // Mark URL field as read-only for protected pages
  const fieldsWithProtection = pageFields.map(field => {
    if (field.name === 'url' && isProtected) {
      return {
        ...field,
        helpText: 'Deze URL is beschermd en kan niet worden gewijzigd',
      };
    }

    return field;
  });

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      <div className='lg:col-span-2'>
        {isProtected && (
          <div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-card'>
            <p className='text-sm text-amber-800'>
              Dit is een beschermde pagina. De URL kan niet worden gewijzigd en de pagina kan niet worden verwijderd.
            </p>
          </div>
        )}
        <ContentForm
          fields={fieldsWithProtection}
          initialData={pageItem.data}
          onSubmit={handleSubmit}
          onValuesChange={setFormValues}
          submitLabel='Wijzigingen opslaan'
          successMessage='Pagina opgeslagen'
          cancelPath='/admin/paginas'
        />
      </div>
      <div className='lg:col-span-1'>
        <div className='sticky top-6 space-y-4'>
          <SeoInsights
            title={(formValues.seoTitle as string | undefined) ?? (formValues.title as string | undefined)}
            description={formValues.seoDescription as string | undefined}
            image={formValues.ogImage as string | undefined}
          />
          <div className='bg-white rounded-card shadow-base p-4'>
            <h3 className='text-sm font-semibold text-gray-800 mb-3'>Acties</h3>
            <Link
              href={pageItem.data?.url ?? '/'}
              target='_blank'
              className='inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-button hover:bg-gray-200 transition-colors'
            >
              <ExternalLink className='w-4 h-4' />
              Bekijk op website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
