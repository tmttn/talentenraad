'use client';

import {useState, useMemo} from 'react';
import {
  X,
  Search,
  LayoutTemplate,
  FileText,
  Users,
  Calendar,
  Newspaper,
  Image,
  MessageSquare,
  Grid,
  Megaphone,
  Star,
  Type,
  Minus,
  Sparkles,
} from 'lucide-react';

type ComponentCategory = {
  name: string;
  icon: React.ReactNode;
  components: ComponentDefinition[];
};

type ComponentDefinition = {
  name: string;
  displayName: string;
  description: string;
  icon: React.ReactNode;
  defaultProps: Record<string, unknown>;
};

const componentCategories: ComponentCategory[] = [
  {
    name: 'Layout',
    icon: <LayoutTemplate className='w-4 h-4' />,
    components: [
      {
        name: 'Section',
        displayName: 'Sectie',
        description: 'Container voor content met achtergrondopties',
        icon: <LayoutTemplate className='w-5 h-5' />,
        defaultProps: {background: 'white', paddingY: 'medium'},
      },
      {
        name: 'Hero',
        displayName: 'Hero',
        description: 'Grote header met achtergrondafbeelding',
        icon: <Image className='w-5 h-5' />,
        defaultProps: {size: 'medium'},
      },
      {
        name: 'Divider',
        displayName: 'Scheidingslijn',
        description: 'Horizontale lijn om secties te scheiden',
        icon: <Minus className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
  {
    name: 'Tekst',
    icon: <Type className='w-4 h-4' />,
    components: [
      {
        name: 'Typography',
        displayName: 'Tekst',
        description: 'Tekstelement met opmaakopties',
        icon: <Type className='w-5 h-5' />,
        defaultProps: {variant: 'body', text: 'Tekst hier...'},
      },
    ],
  },
  {
    name: 'Marketing',
    icon: <Megaphone className='w-4 h-4' />,
    components: [
      {
        name: 'CtaBanner',
        displayName: 'CTA Banner',
        description: 'Opvallende call-to-action banner',
        icon: <Megaphone className='w-5 h-5' />,
        defaultProps: {title: 'Titel', buttonText: 'Klik hier'},
      },
      {
        name: 'CTAButton',
        displayName: 'CTA Knop',
        description: 'Call-to-action knop',
        icon: <Star className='w-5 h-5' />,
        defaultProps: {text: 'Klik hier', href: '/'},
      },
      {
        name: 'UnifiedCTA',
        displayName: 'Unified CTA',
        description: 'Flexibele CTA sectie',
        icon: <Sparkles className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'AnnouncementBanner',
        displayName: 'Aankondiging',
        description: 'Aankondigingsbalk',
        icon: <Megaphone className='w-5 h-5' />,
        defaultProps: {text: 'Aankondiging tekst'},
      },
    ],
  },
  {
    name: 'Activiteiten',
    icon: <Calendar className='w-4 h-4' />,
    components: [
      {
        name: 'ActivitiesList',
        displayName: 'Activiteiten Lijst',
        description: 'Overzicht van aankomende activiteiten',
        icon: <Calendar className='w-5 h-5' />,
        defaultProps: {limit: 3},
      },
      {
        name: 'CalendarSection',
        displayName: 'Kalender Sectie',
        description: 'Maandkalender met activiteiten',
        icon: <Calendar className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'EventCard',
        displayName: 'Event Kaart',
        description: 'Individuele activiteit kaart',
        icon: <Calendar className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'ActivitiesArchive',
        displayName: 'Activiteiten Archief',
        description: 'Archief van afgelopen activiteiten',
        icon: <Calendar className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
  {
    name: 'Nieuws',
    icon: <Newspaper className='w-4 h-4' />,
    components: [
      {
        name: 'NewsList',
        displayName: 'Nieuws Lijst',
        description: 'Overzicht van nieuwsartikelen',
        icon: <Newspaper className='w-5 h-5' />,
        defaultProps: {limit: 6},
      },
      {
        name: 'NewsCard',
        displayName: 'Nieuws Kaart',
        description: 'Individuele nieuws kaart',
        icon: <Newspaper className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
  {
    name: 'Team',
    icon: <Users className='w-4 h-4' />,
    components: [
      {
        name: 'TeamGrid',
        displayName: 'Team Grid',
        description: 'Raster van teamleden',
        icon: <Users className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'TeamMember',
        displayName: 'Teamlid',
        description: 'Individueel teamlid',
        icon: <Users className='w-5 h-5' />,
        defaultProps: {name: 'Naam', role: 'Rol'},
      },
    ],
  },
  {
    name: 'Info',
    icon: <FileText className='w-4 h-4' />,
    components: [
      {
        name: 'InfoCard',
        displayName: 'Info Kaart',
        description: 'Kaart met informatie',
        icon: <FileText className='w-5 h-5' />,
        defaultProps: {title: 'Titel', description: 'Beschrijving'},
      },
      {
        name: 'FeatureGrid',
        displayName: 'Feature Grid',
        description: 'Raster van features/voordelen',
        icon: <Grid className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'FAQ',
        displayName: 'FAQ',
        description: 'Veelgestelde vragen',
        icon: <MessageSquare className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
  {
    name: 'Media',
    icon: <Image className='w-4 h-4' />,
    components: [
      {
        name: 'PhotoGallery',
        displayName: 'Fotogalerij',
        description: 'Galerij met foto\'s',
        icon: <Image className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'Decoration',
        displayName: 'Decoratie',
        description: 'Decoratief element',
        icon: <Sparkles className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
  {
    name: 'Contact',
    icon: <MessageSquare className='w-4 h-4' />,
    components: [
      {
        name: 'ContactForm',
        displayName: 'Contactformulier',
        description: 'Formulier voor contactverzoeken',
        icon: <MessageSquare className='w-5 h-5' />,
        defaultProps: {},
      },
      {
        name: 'NewsletterSignup',
        displayName: 'Nieuwsbrief Aanmelding',
        description: 'Aanmeldformulier voor nieuwsbrief',
        icon: <Newspaper className='w-5 h-5' />,
        defaultProps: {},
      },
    ],
  },
];

type ComponentPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (component: ComponentDefinition) => void;
};

export function ComponentPicker({isOpen, onClose, onSelect}: ComponentPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return componentCategories;
    }

    const query = searchQuery.toLowerCase();
    return componentCategories.map(category => ({
      ...category,
      components: category.components.filter(
        comp =>
          comp.displayName.toLowerCase().includes(query)
          || comp.description.toLowerCase().includes(query),
      ),
    })).filter(category => category.components.length > 0);
  }, [searchQuery]);

  const handleSelect = (component: ComponentDefinition) => {
    onSelect(component);
    onClose();
    setSearchQuery('');
    setSelectedCategory(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-modal shadow-elevated w-full max-w-2xl max-h-[80vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-bold text-gray-800'>Component toevoegen</h2>
          <button
            type='button'
            onClick={onClose}
            className='p-2 rounded-button hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Search */}
        <div className='px-6 py-4 border-b border-gray-200'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Zoek component...'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
              }}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-button focus:outline-none focus:ring-2 focus:ring-primary/30'
            />
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Category tabs */}
          {!searchQuery && (
            <div className='flex gap-2 px-6 py-3 overflow-x-auto border-b border-gray-200'>
              <button
                type='button'
                onClick={() => {
                  setSelectedCategory(null);
                }}
                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alle
              </button>
              {componentCategories.map(category => (
                <button
                  key={category.name}
                  type='button'
                  onClick={() => {
                    setSelectedCategory(category.name);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Components grid */}
          <div className='p-6'>
            {filteredCategories
              .filter(category => !selectedCategory || category.name === selectedCategory)
              .map(category => (
                <div key={category.name} className='mb-6 last:mb-0'>
                  <h3 className='text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2'>
                    {category.icon}
                    {category.name}
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {category.components.map(component => (
                      <button
                        key={component.name}
                        type='button'
                        onClick={() => {
                          handleSelect(component);
                        }}
                        className='flex items-start gap-3 p-3 text-left rounded-card border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors'
                      >
                        <div className='p-2 bg-gray-100 rounded-button text-gray-600'>
                          {component.icon}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='font-medium text-gray-800'>
                            {component.displayName}
                          </div>
                          <div className='text-sm text-gray-500 truncate'>
                            {component.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export type {ComponentDefinition};
