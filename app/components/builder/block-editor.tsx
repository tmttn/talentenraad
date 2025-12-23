'use client';

import {useState, useCallback} from 'react';
import {X, Save} from 'lucide-react';

// Builder.io block type
type BuilderBlock = {
  '@type': '@builder.io/sdk:Element';
  id: string;
  component?: {
    name: string;
    options?: Record<string, unknown>;
  };
  children?: BuilderBlock[];
  responsiveStyles?: Record<string, unknown>;
  [key: string]: unknown;
};

type BlockEditorProps = {
  block: BuilderBlock;
  onSave: (block: BuilderBlock) => void;
  onClose: () => void;
};

type FieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'unknown';

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  helpText?: string;
};

// Field configurations for known components with helpful descriptions
const componentFieldConfigs: Record<string, FieldConfig[]> = {
  Section: [
    {
      key: 'background',
      label: 'Achtergrond',
      type: 'select',
      options: ['white', 'gray', 'primary', 'secondary'],
      helpText: 'Kies de achtergrondkleur van deze sectie',
    },
    {
      key: 'paddingY',
      label: 'Verticale ruimte',
      type: 'select',
      options: ['none', 'small', 'medium', 'large'],
      helpText: 'Ruimte boven en onder de inhoud',
    },
  ],
  Hero: [
    {
      key: 'title',
      label: 'Titel',
      type: 'text',
      placeholder: 'Bijv. Welkom bij onze website',
      helpText: 'De hoofdtekst van de hero',
    },
    {
      key: 'subtitle',
      label: 'Ondertitel',
      type: 'text',
      placeholder: 'Bijv. Ontdek wat wij doen',
      helpText: 'Optionele tekst onder de titel',
    },
    {
      key: 'size',
      label: 'Grootte',
      type: 'select',
      options: ['small', 'medium', 'large'],
      helpText: 'Bepaalt de hoogte van de hero',
    },
    {
      key: 'imageUrl',
      label: 'Afbeelding URL',
      type: 'text',
      placeholder: 'https://...',
      helpText: 'URL van de achtergrondafbeelding',
    },
  ],
  Typography: [
    {
      key: 'text',
      label: 'Tekst',
      type: 'textarea',
      placeholder: 'Voer hier je tekst in...',
      helpText: 'De tekst die wordt weergegeven',
    },
    {
      key: 'variant',
      label: 'Stijl',
      type: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'body', 'small'],
      helpText: 'h1-h4 zijn koppen, body is normale tekst',
    },
  ],
  CtaBanner: [
    {
      key: 'title',
      label: 'Titel',
      type: 'text',
      placeholder: 'Bijv. Neem contact op',
      helpText: 'De opvallende tekst',
    },
    {
      key: 'description',
      label: 'Beschrijving',
      type: 'textarea',
      placeholder: 'Bijv. Wij helpen je graag verder...',
      helpText: 'Ondersteunende tekst',
    },
    {
      key: 'buttonText',
      label: 'Knoptekst',
      type: 'text',
      placeholder: 'Bijv. Meer info',
      helpText: 'Tekst op de actieknop',
    },
    {
      key: 'buttonUrl',
      label: 'Knop URL',
      type: 'text',
      placeholder: '/contact',
      helpText: 'Waar de knop naartoe linkt',
    },
  ],
  CTAButton: [
    {
      key: 'text',
      label: 'Tekst',
      type: 'text',
      placeholder: 'Bijv. Klik hier',
      helpText: 'De tekst op de knop',
    },
    {
      key: 'href',
      label: 'URL',
      type: 'text',
      placeholder: '/pagina of https://...',
      helpText: 'Waar de knop naartoe linkt',
    },
    {
      key: 'variant',
      label: 'Stijl',
      type: 'select',
      options: ['primary', 'secondary', 'outline'],
      helpText: 'Het uiterlijk van de knop',
    },
  ],
  AnnouncementBanner: [
    {
      key: 'text',
      label: 'Tekst',
      type: 'text',
      placeholder: 'Bijv. Nieuw: onze zomerprogramma\'s',
      helpText: 'De aankondigingstekst',
    },
    {
      key: 'linkText',
      label: 'Link tekst',
      type: 'text',
      placeholder: 'Bijv. Lees meer',
      helpText: 'Tekst van de link',
    },
    {
      key: 'linkUrl',
      label: 'Link URL',
      type: 'text',
      placeholder: '/nieuws/...',
      helpText: 'Waar de link naartoe gaat',
    },
  ],
  ActivitiesList: [
    {
      key: 'limit',
      label: 'Aantal activiteiten',
      type: 'number',
      helpText: 'Hoeveel activiteiten er getoond worden',
    },
    {
      key: 'showPast',
      label: 'Toon afgelopen activiteiten',
      type: 'boolean',
      helpText: 'Ook activiteiten uit het verleden tonen',
    },
  ],
  NewsList: [
    {
      key: 'limit',
      label: 'Aantal nieuwsberichten',
      type: 'number',
      helpText: 'Hoeveel nieuwsberichten er getoond worden',
    },
  ],
  TeamMember: [
    {
      key: 'name',
      label: 'Naam',
      type: 'text',
      placeholder: 'Bijv. Jan Jansen',
      helpText: 'Volledige naam van het teamlid',
    },
    {
      key: 'role',
      label: 'Rol',
      type: 'text',
      placeholder: 'Bijv. Voorzitter',
      helpText: 'Functie of rol',
    },
    {
      key: 'imageUrl',
      label: 'Foto URL',
      type: 'text',
      placeholder: 'https://...',
      helpText: 'URL van de profielfoto',
    },
    {
      key: 'bio',
      label: 'Bio',
      type: 'textarea',
      placeholder: 'Korte beschrijving...',
      helpText: 'Korte beschrijving van het teamlid',
    },
  ],
  InfoCard: [
    {
      key: 'title',
      label: 'Titel',
      type: 'text',
      placeholder: 'Bijv. Over ons',
      helpText: 'De titel van de kaart',
    },
    {
      key: 'description',
      label: 'Beschrijving',
      type: 'textarea',
      placeholder: 'Beschrijf hier...',
      helpText: 'De inhoud van de kaart',
    },
    {
      key: 'icon',
      label: 'Icoon',
      type: 'text',
      placeholder: 'Bijv. star, heart, users',
      helpText: 'Naam van het Lucide icoon',
    },
  ],
};

function getFieldType(value: unknown): FieldType {
  if (typeof value === 'string') {
    return value.length > 100 ? 'textarea' : 'text';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  return 'unknown';
}

function formatLabel(key: string): string {
  return key
    .replaceAll(/([A-Z])/g, ' $1')
    .replaceAll(/^./, str => str.toUpperCase())
    .trim();
}

// Extract block options from various possible locations in Builder.io blocks
function extractBlockOptions(block: BuilderBlock): Record<string, unknown> {
  // First try component.options (standard location for custom components)
  const componentOptions = block.component?.options ?? {};

  // Builder.io sometimes stores props directly on the block
  // Extract any non-standard properties from the block itself
  const blockLevelProps: Record<string, unknown> = {};
  const reservedKeys = new Set(['@type', 'id', 'component', 'children', 'responsiveStyles', 'meta', 'layerName', 'tagName', 'class', 'properties', 'bindings', 'actions', 'code']);

  for (const [key, value] of Object.entries(block)) {
    if (!reservedKeys.has(key) && value !== undefined) {
      blockLevelProps[key] = value;
    }
  }

  // Merge both sources, with component options taking precedence
  return {...blockLevelProps, ...componentOptions};
}

export function BlockEditor({block, onSave, onClose}: BlockEditorProps) {
  const [options, setOptions] = useState<Record<string, unknown>>(
    extractBlockOptions(block),
  );

  const componentName = block.component?.name ?? 'Unknown';
  const fieldConfigs = componentFieldConfigs[componentName];

  const handleChange = useCallback((key: string, value: unknown) => {
    setOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedBlock: BuilderBlock = {
      ...block,
      component: {
        ...block.component,
        name: block.component?.name ?? '',
        options,
      },
    };
    onSave(updatedBlock);
  }, [block, options, onSave]);

  const renderField = (key: string, value: unknown, config?: FieldConfig) => {
    const label = config?.label ?? formatLabel(key);
    const type = config?.type ?? getFieldType(value);
    const placeholder = config?.placeholder ?? '';
    const helpText = config?.helpText;

    const fieldId = `field-${key}`;

    const helpTextElement = helpText ? (
      <p className='mt-1 text-xs text-gray-500'>{helpText}</p>
    ) : null;

    switch (type) {
      case 'text': {
        return (
          <div key={key} className='mb-4'>
            <label htmlFor={fieldId} className='block text-sm font-medium text-gray-700 mb-1'>
              {label}
            </label>
            <input
              id={fieldId}
              type='text'
              value={String(value ?? '')}
              placeholder={placeholder}
              onChange={e => {
                handleChange(key, e.target.value);
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-gray-400'
            />
            {helpTextElement}
          </div>
        );
      }

      case 'textarea': {
        return (
          <div key={key} className='mb-4'>
            <label htmlFor={fieldId} className='block text-sm font-medium text-gray-700 mb-1'>
              {label}
            </label>
            <textarea
              id={fieldId}
              value={String(value ?? '')}
              placeholder={placeholder}
              onChange={e => {
                handleChange(key, e.target.value);
              }}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-gray-400'
            />
            {helpTextElement}
          </div>
        );
      }

      case 'number': {
        return (
          <div key={key} className='mb-4'>
            <label htmlFor={fieldId} className='block text-sm font-medium text-gray-700 mb-1'>
              {label}
            </label>
            <input
              id={fieldId}
              type='number'
              value={Number(value ?? 0)}
              placeholder={placeholder}
              onChange={e => {
                handleChange(key, Number.parseInt(e.target.value, 10));
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30'
            />
            {helpTextElement}
          </div>
        );
      }

      case 'boolean': {
        return (
          <div key={key} className='mb-4'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={Boolean(value)}
                onChange={e => {
                  handleChange(key, e.target.checked);
                }}
                className='w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary/30'
              />
              <span className='text-sm font-medium text-gray-700'>{label}</span>
            </label>
            {helpText && <p className='mt-1 text-xs text-gray-500 ml-6'>{helpText}</p>}
          </div>
        );
      }

      case 'select': {
        return (
          <div key={key} className='mb-4'>
            <label htmlFor={fieldId} className='block text-sm font-medium text-gray-700 mb-1'>
              {label}
            </label>
            <select
              id={fieldId}
              value={String(value ?? '')}
              onChange={e => {
                handleChange(key, e.target.value);
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30'
            >
              {config?.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {helpTextElement}
          </div>
        );
      }

      case 'unknown': {
        // Unknown field types are not rendered
        return null;
      }
    }
  };

  // Get all fields to display
  const fieldsToRender = fieldConfigs
    ? fieldConfigs.map(config => ({
      key: config.key,
      value: options[config.key],
      config,
    }))
    : Object.entries(options).map(([key, value]) => ({
      key,
      value,
      config: undefined,
    }));

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-modal shadow-elevated w-full max-w-md max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-bold text-gray-800'>
            {componentName} bewerken
          </h2>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-button hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {fieldsToRender.length === 0 ? (
            <p className='text-gray-500 text-center py-4'>
              Dit component heeft geen bewerkbare eigenschappen.
            </p>
          ) : (
            fieldsToRender.map(({key, value, config}) =>
              renderField(key, value, config),
            )
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-button transition-colors'
          >
            Annuleren
          </button>
          <button
            type='button'
            onClick={handleSave}
            className='flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors'
          >
            <Save className='w-4 h-4' />
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
