'use client';

import {useId, useState} from 'react';
import {ArrowDown, ArrowUp, Plus, Trash2} from 'lucide-react';
import {FormField, Input, Switch} from '@components/ui';
import {legeAfhaalRij, leesAfhaalRijen, type AfhaalRij} from '@lib/content-store/actie-form';
import {ProductenField} from './producten-field';
import {secondaryButton} from './styles';

const iconButton = 'inline-flex items-center justify-center w-10 h-10 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const checkboxClass = 'w-4 h-4 rounded border-gray-300 accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

type Properties = {
  /** String values of the form (see actieFormWaarden); empty for a new sale. */
  values: Record<string, string>;
  errors: Record<string, string>;
};

function AfhaalmomentenField({initial, error}: Readonly<{initial?: string; error?: string}>) {
  const id = useId();
  const [rows, setRows] = useState<AfhaalRij[]>(() => {
    const parsed = leesAfhaalRijen(initial);
    return parsed.length > 0 ? parsed : [legeAfhaalRij()];
  });

  const update = (index: number, key: 'datum' | 'uur' | 'plaats', value: string) => {
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
      <legend className='block text-sm font-medium text-gray-700'>Afhaalmomenten</legend>
      <p id={`${id}-hint`} className='text-sm text-gray-500'>
        Wanneer en waar ouders hun bestelling ophalen. Ouders kiezen er één bij het bestellen.
      </p>
      <input type='hidden' name='afhalen' value={JSON.stringify(rows)} />

      <ol className='space-y-3'>
        {rows.map((row, index) => {
          const label = `Afhaalmoment ${index + 1}`;
          const invalid = Boolean(error) && index === 0;
          return (
            // Rows have no stable id while new; the index is the identity while editing
            <li key={index} className='grid gap-2 rounded-card border border-gray-200 p-3 sm:grid-cols-[10rem_9rem_1fr_auto] sm:items-center'>
              <Input
                type='date'
                aria-label={`${label}: datum`}
                value={row.datum}
                error={invalid}
                aria-invalid={invalid ? true : undefined}
                onChange={event => {
                  update(index, 'datum', event.target.value);
                }}
              />
              <Input
                aria-label={`${label}: uur`}
                placeholder='17:00 - 19:00'
                value={row.uur}
                onChange={event => {
                  update(index, 'uur', event.target.value);
                }}
              />
              <Input
                aria-label={`${label}: plaats`}
                placeholder='Refter van het Talentenhuis'
                value={row.plaats}
                onChange={event => {
                  update(index, 'plaats', event.target.value);
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

      {error && <p id={`${id}-error`} className='text-sm text-red-600'>{error}</p>}

      <button
        type='button'
        className={secondaryButton}
        onClick={() => {
          setRows(previous => [...previous, legeAfhaalRij()]);
        }}
      >
        <Plus className='w-4 h-4' aria-hidden='true' />
        Afhaalmoment toevoegen
      </button>
    </fieldset>
  );
}

/**
 * The fields of a sale besides title, summary, image and description: ordering period,
 * payment, pickup moments and products. Every input is controlled, so a failed save keeps them.
 */
export function ActieFields({values, errors}: Readonly<Properties>) {
  const id = useId();
  const [van, setVan] = useState(values.bestellenVan ?? '');
  const [tot, setTot] = useState(values.bestellenTot ?? '');
  const [binnenDagen, setBinnenDagen] = useState(values.binnenDagen ?? '5');
  // A new sale starts with transfer ticked; a saved one keeps what it has
  const isNew = values.bestellenVan === undefined;
  const [overschrijving, setOverschrijving] = useState(isNew || values.wijzeOverschrijving === 'on');
  const [cash, setCash] = useState(values.wijzeCash === 'on');
  const [kind, setKind] = useState(values.vraagKind === 'on');

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-3'>
        <FormField label='Bestellen vanaf' htmlFor={`${id}-van`} required error={errors.bestellenVan}>
          <Input
            id={`${id}-van`}
            name='bestellenVan'
            type='date'
            value={van}
            error={Boolean(errors.bestellenVan)}
            aria-invalid={errors.bestellenVan ? true : undefined}
            onChange={event => {
              setVan(event.target.value);
            }}
          />
        </FormField>
        <FormField label='Bestellen tot en met' htmlFor={`${id}-tot`} required error={errors.bestellenTot} hint='Daarna sluit het formulier.'>
          <Input
            id={`${id}-tot`}
            name='bestellenTot'
            type='date'
            value={tot}
            error={Boolean(errors.bestellenTot)}
            aria-invalid={errors.bestellenTot ? true : undefined}
            onChange={event => {
              setTot(event.target.value);
            }}
          />
        </FormField>
        <FormField label='Betalen binnen (dagen)' htmlFor={`${id}-dagen`} error={errors.binnenDagen} hint='Na het bestellen.'>
          <Input
            id={`${id}-dagen`}
            name='binnenDagen'
            inputMode='numeric'
            value={binnenDagen}
            error={Boolean(errors.binnenDagen)}
            aria-invalid={errors.binnenDagen ? true : undefined}
            onChange={event => {
              setBinnenDagen(event.target.value);
            }}
          />
        </FormField>
      </div>

      <fieldset className='space-y-2' aria-describedby={errors.betaalwijzen ? `${id}-wijzen-error` : undefined}>
        <legend className='block text-sm font-medium text-gray-700'>Betalen</legend>
        <label className='flex items-center gap-2 text-gray-800'>
          <input
            type='checkbox'
            name='wijzeOverschrijving'
            className={checkboxClass}
            checked={overschrijving}
            aria-invalid={errors.betaalwijzen ? true : undefined}
            onChange={event => {
              setOverschrijving(event.target.checked);
            }}
          />
          Overschrijving (met gestructureerde mededeling)
        </label>
        <label className='flex items-center gap-2 text-gray-800'>
          <input
            type='checkbox'
            name='wijzeCash'
            className={checkboxClass}
            checked={cash}
            onChange={event => {
              setCash(event.target.checked);
            }}
          />
          Cash, af te geven vóór het afhalen
        </label>
        {errors.betaalwijzen && <p id={`${id}-wijzen-error`} className='text-sm text-red-600'>{errors.betaalwijzen}</p>}
      </fieldset>

      <Switch
        id={`${id}-kind`}
        label='Naam en klas van een kind vragen'
        description='Alleen nodig als je in de klas levert. Anders altijd uit laten.'
        name='vraagKind'
        checked={kind}
        onChange={event => {
          setKind(event.target.checked);
        }}
      />

      <AfhaalmomentenField initial={values.afhalen} error={errors.afhalen} />
      <ProductenField initial={values.producten} error={errors.producten} />
    </div>
  );
}
