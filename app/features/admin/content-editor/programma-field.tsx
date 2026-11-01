'use client';

import {useId, useState} from 'react';
import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';
import {Input} from '@components/ui';
import {secondaryButton} from './styles';

export type ProgrammaRij = {uur: string; titel: string; info: string};

type Properties = {
  name: string;
  /** The current list as JSON, as the server hands it to the form. */
  initial?: string;
  error?: string;
};

const iconButton = 'inline-flex items-center justify-center w-10 h-10 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export function parseRows(json: string | undefined): ProgrammaRij[] {
  if (!json) {
    return [];
  }

  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(item => {
      const row = (item ?? {}) as Record<string, unknown>;
      const text = (key: string) => (typeof row[key] === 'string' ? row[key] : '');
      return {uur: text('uur'), titel: text('titel'), info: text('info')};
    });
  } catch {
    return [];
  }
}

/**
 * Repeatable rows (uur, titel, info) for an activity's programme.
 * The rows travel to the server as JSON in one hidden field; the schema validates them there.
 */
export function ProgrammaField({name, initial, error}: Readonly<Properties>) {
  const id = useId();
  const [rows, setRows] = useState<ProgrammaRij[]>(() => parseRows(initial));

  const update = (index: number, key: keyof ProgrammaRij, value: string) => {
    setRows(previous => previous.map((row, i) => (i === index ? {...row, [key]: value} : row)));
  };

  const move = (index: number, offset: -1 | 1) => {
    setRows(previous => {
      const next = [...previous];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  };

  return (
    <fieldset className='space-y-3' aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}>
      <legend className='block text-sm font-medium text-gray-700'>Programma</legend>
      <p id={`${id}-hint`} className='text-sm text-gray-500'>
        Optioneel. Eén rij per moment, bijvoorbeeld 14:00 · Kerstspel kleuters · Deuren vanaf 13:30.
      </p>
      <input type='hidden' name={name} value={JSON.stringify(rows)} />

      {rows.length > 0 && (
        <ol className='space-y-3'>
          {rows.map((row, index) => {
            const label = `Programmapunt ${index + 1}`;
            return (
              // Rows have no stable id; the index is the identity while editing
              <li key={index} className='grid gap-2 rounded-card border border-gray-200 p-3 sm:grid-cols-[6rem_1fr_1fr_auto] sm:items-center'>
                <Input
                  aria-label={`${label}: uur`}
                  placeholder='14:00'
                  value={row.uur}
                  error={Boolean(error) && row.uur.trim() === ''}
                  aria-invalid={error && row.uur.trim() === '' ? true : undefined}
                  onChange={event => {
                    update(index, 'uur', event.target.value);
                  }}
                />
                <Input
                  aria-label={`${label}: titel`}
                  placeholder='Titel'
                  value={row.titel}
                  error={Boolean(error) && row.titel.trim() === ''}
                  aria-invalid={error && row.titel.trim() === '' ? true : undefined}
                  onChange={event => {
                    update(index, 'titel', event.target.value);
                  }}
                />
                <Input
                  aria-label={`${label}: info (optioneel)`}
                  placeholder='Info (optioneel)'
                  value={row.info}
                  onChange={event => {
                    update(index, 'info', event.target.value);
                  }}
                />
                <div className='flex'>
                  <button type='button' className={iconButton} aria-label={`${label} omhoog`} disabled={index === 0} onClick={() => {
                    move(index, -1);
                  }}>
                    <ArrowUp className='w-4 h-4' aria-hidden='true' />
                  </button>
                  <button type='button' className={iconButton} aria-label={`${label} omlaag`} disabled={index === rows.length - 1} onClick={() => {
                    move(index, 1);
                  }}>
                    <ArrowDown className='w-4 h-4' aria-hidden='true' />
                  </button>
                  <button type='button' className={iconButton} aria-label={`${label} verwijderen`} onClick={() => {
                    setRows(previous => previous.filter((_, i) => i !== index));
                  }}>
                    <Trash2 className='w-4 h-4' aria-hidden='true' />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {error && <p id={`${id}-error`} className='text-sm text-red-600'>{error}</p>}

      <button
        type='button'
        className={secondaryButton}
        onClick={() => {
          setRows(previous => [...previous, {uur: '', titel: '', info: ''}]);
        }}
      >
        <Plus className='w-4 h-4' aria-hidden='true' />
        Programmapunt toevoegen
      </button>
    </fieldset>
  );
}
