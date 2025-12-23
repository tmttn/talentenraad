'use client';

import {
  useState, useMemo, type FormEvent, type ChangeEvent,
} from 'react';
import {useRouter} from 'next/navigation';
import {
  Plus, Power, PowerOff, Pencil, Trash2,
} from 'lucide-react';
import type {Announcement, AnnouncementType} from '@lib/builder-types';
import {DeleteDialog} from '@features/admin/delete-dialog';
import {TableFilters} from '@features/admin/table-filters';
import {ExportButton} from '@features/admin/export-button';

type AankondigingenManagerProps = {
  announcements: Announcement[];
};

const typeLabels: Record<AnnouncementType, string> = {
  info: 'Info (blauw)',
  waarschuwing: 'Waarschuwing (oranje)',
  belangrijk: 'Belangrijk (rood)',
};

const typeColors: Record<AnnouncementType, string> = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  waarschuwing: 'bg-orange-100 text-orange-800 border-orange-200',
  belangrijk: 'bg-red-100 text-red-800 border-red-200',
};

const inputStyles = [
  'w-full px-4 py-3 border-2 border-gray-300 rounded-button bg-white text-gray-900',
  'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
  'transition-colors duration-fast',
].join(' ');

type FormData = {
  tekst: string;
  type: AnnouncementType;
  link: string;
  linkTekst: string;
  actief: boolean;
};

const emptyForm: FormData = {
  tekst: '',
  type: 'info',
  link: '',
  linkTekst: '',
  actief: true,
};

const typeFilterOptions = [
  {value: 'info', label: 'Info (blauw)'},
  {value: 'waarschuwing', label: 'Waarschuwing (oranje)'},
  {value: 'belangrijk', label: 'Belangrijk (rood)'},
];

const statusFilterOptions = [
  {value: 'active', label: 'Actief'},
  {value: 'inactive', label: 'Inactief'},
];

export function AankondigingenManager({announcements}: AankondigingenManagerProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setFormData({
      tekst: announcement.data.tekst,
      type: announcement.data.type,
      link: announcement.data.link ?? '',
      linkTekst: announcement.data.linkTekst ?? '',
      actief: announcement.data.actief,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(emptyForm);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.tekst.trim()) {
        throw new Error('Tekst is verplicht');
      }

      const data = {
        tekst: formData.tekst,
        type: formData.type,
        link: formData.link || undefined,
        linkTekst: formData.linkTekst || undefined,
        actief: formData.actief,
      };

      const url = editingId
        ? `/api/admin/content/aankondiging/${editingId}`
        : '/api/admin/content/aankondiging';

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({data, publish: true}),
      });

      if (!response.ok) {
        throw new Error('Opslaan mislukt');
      }

      handleCancel();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) {
      return;
    }

    const response = await fetch(`/api/admin/content/aankondiging/${deleteItem.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Verwijderen mislukt');
    }

    setDeleteItem(null);
    router.refresh();
  };

  const handleToggleActive = async (announcement: Announcement) => {
    const response = await fetch(`/api/admin/content/aankondiging/${announcement.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        data: {...announcement.data, actief: !announcement.data.actief},
        publish: true,
      }),
    });

    if (!response.ok) {
      setError('Status wijzigen mislukt');
      return;
    }

    router.refresh();
  };

  // Filter announcements
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.data.tekst.toLowerCase().includes(query)
        || item.data.linkTekst?.toLowerCase().includes(query));
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter(item => item.data.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(item => statusFilter === 'active' ? item.data.actief : !item.data.actief);
    }

    return result;
  }, [announcements, searchQuery, typeFilter, statusFilter]);

  const filterConfigs = [
    {
      key: 'type',
      label: 'Alle types',
      options: typeFilterOptions,
      value: typeFilter,
      onChange: setTypeFilter,
    },
    {
      key: 'status',
      label: 'Alle statussen',
      options: statusFilterOptions,
      value: statusFilter,
      onChange: setStatusFilter,
    },
  ];

  const renderForm = () => (
    <form onSubmit={handleSubmit} className='bg-white rounded-card shadow-base p-6 mb-6'>
      <h2 className='text-xl font-bold text-gray-800 mb-4'>
        {editingId ? 'Aankondiging bewerken' : 'Nieuwe aankondiging'}
      </h2>

      {error && (
        <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-button text-red-800'>
          {error}
        </div>
      )}

      <div className='space-y-4'>
        <div>
          <label htmlFor='tekst' className='block text-sm font-semibold text-gray-800 mb-2'>
            Tekst <span className='text-red-500'>*</span>
          </label>
          <textarea
            id='tekst'
            value={formData.tekst}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setFormData(previous => ({...previous, tekst: e.target.value}));
            }}
            required
            rows={3}
            className={inputStyles}
            placeholder='De tekst van de aankondiging'
          />
        </div>

        <div>
          <label htmlFor='type' className='block text-sm font-semibold text-gray-800 mb-2'>
            Type
          </label>
          <select
            id='type'
            value={formData.type}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setFormData(previous => ({...previous, type: e.target.value as AnnouncementType}));
            }}
            className={inputStyles}
          >
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <label htmlFor='link' className='block text-sm font-semibold text-gray-800 mb-2'>
              Link URL (optioneel)
            </label>
            <input
              type='url'
              id='link'
              value={formData.link}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData(previous => ({...previous, link: e.target.value}));
              }}
              className={inputStyles}
              placeholder='https://...'
            />
          </div>
          <div>
            <label htmlFor='linkTekst' className='block text-sm font-semibold text-gray-800 mb-2'>
              Link tekst (optioneel)
            </label>
            <input
              type='text'
              id='linkTekst'
              value={formData.linkTekst}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData(previous => ({...previous, linkTekst: e.target.value}));
              }}
              className={inputStyles}
              placeholder='Meer info'
            />
          </div>
        </div>

        <div>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={formData.actief}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData(previous => ({...previous, actief: e.target.checked}));
              }}
              className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary'
            />
            <span className='text-gray-700'>Actief (toon op de website)</span>
          </label>
        </div>
      </div>

      <div className='mt-6 flex gap-4'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='px-6 py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors disabled:opacity-50'
        >
          {isSubmitting ? 'Bezig...' : 'Opslaan'}
        </button>
        <button
          type='button'
          onClick={handleCancel}
          disabled={isSubmitting}
          className='px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-card hover:bg-gray-200 transition-colors disabled:opacity-50'
        >
          Annuleren
        </button>
      </div>
    </form>
  );

  return (
    <div>
      <TableFilters
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Zoeken op tekst...'
        filters={filterConfigs}
      >
        {!isCreating && !editingId && (
          <button
            type='button'
            onClick={handleCreate}
            className='px-4 py-2.5 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors flex items-center gap-2 whitespace-nowrap'
          >
            <Plus className='w-4 h-4' />
            Nieuwe aankondiging
          </button>
        )}
      </TableFilters>

      {(isCreating || editingId) && renderForm()}

      <div className='space-y-4'>
        {filteredAnnouncements.length === 0
          ? (
            <div className='bg-white rounded-card p-8 text-center text-gray-500'>
              {searchQuery || typeFilter || statusFilter
                ? 'Geen aankondigingen gevonden met de huidige filters.'
                : 'Geen aankondigingen gevonden.'}
            </div>
          )
          : (
            filteredAnnouncements.map(announcement => (
              <div
                key={announcement.id}
                className={`bg-white rounded-card shadow-base p-6 border-l-4 ${
                  announcement.data.actief ? typeColors[announcement.data.type] : 'border-gray-300'
                }`}
              >
                <div className='flex justify-between items-start gap-4'>
                  <div className='flex-1'>
                    <p className={`font-medium ${announcement.data.actief ? '' : 'text-gray-400'}`}>
                      {announcement.data.tekst}
                    </p>
                    {announcement.data.link && (
                      <p className='text-sm text-gray-500 mt-1'>
                        Link: <a href={announcement.data.link} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>{announcement.data.linkTekst ?? announcement.data.link}</a>
                      </p>
                    )}
                    <div className='flex gap-2 mt-2'>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[announcement.data.type]}`}>
                        {typeLabels[announcement.data.type]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        announcement.data.actief
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {announcement.data.actief ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                  </div>
                  <div className='flex gap-1 sm:gap-2'>
                    <button
                      type='button'
                      onClick={() => {
                        void handleToggleActive(announcement);
                      }}
                      title={announcement.data.actief ? 'Deactiveer' : 'Activeer'}
                      className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors'
                    >
                      {announcement.data.actief ? <PowerOff className='w-4 h-4' /> : <Power className='w-4 h-4' />}
                      <span className='hidden lg:inline'>{announcement.data.actief ? 'Deactiveer' : 'Activeer'}</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        handleEdit(announcement);
                      }}
                      title='Bewerken'
                      className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors'
                    >
                      <Pencil className='w-4 h-4' />
                      <span className='hidden lg:inline'>Bewerk</span>
                    </button>
                    <ExportButton
                      contentType='aankondiging'
                      itemId={announcement.id}
                      label='Exporteer'
                      variant='icon'
                    />
                    <button
                      type='button'
                      onClick={() => {
                        setDeleteItem(announcement);
                      }}
                      title='Verwijderen'
                      className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                      <span className='hidden lg:inline'>Verwijder</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
      </div>

      {deleteItem && (
        <DeleteDialog
          title='Aankondiging verwijderen?'
          message='Weet je zeker dat je deze aankondiging wilt verwijderen?'
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
}
