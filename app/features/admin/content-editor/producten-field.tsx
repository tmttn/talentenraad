'use client';

import {useId, useState} from 'react';
import {ArrowDown, ArrowUp, Plus, Trash2, X} from 'lucide-react';
import {FormField, Input} from '@components/ui';
import {
  legeProductRij, leesProductRijen, type OptieRij, type ProductRij,
} from '@lib/content-store/actie-form';
import {secondaryButton} from './styles';

const iconButton = 'inline-flex items-center justify-center w-10 h-10 rounded-button text-gray-600 hover:bg-gray-100 disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const smallButton = 'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-text rounded-button hover:bg-brand-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary';

type Properties = {
  /** The products as JSON rows, as the server hands them to the form. */
  initial?: string;
  error?: string;
};

function move<T>(items: T[], index: number, offset: -1 | 1): T[] {
  const next = [...items];
  [next[index], next[index + offset]] = [next[index + offset], next[index]];
  return next;
}

function OptieEditor({optie, label, onChange, onRemove}: Readonly<{
  optie: OptieRij;
  label: string;
  onChange: (optie: OptieRij) => void;
  onRemove: () => void;
}>) {
  const id = useId();
  const setKeuze = (index: number, key: 'naam' | 'meerprijs', value: string) => {
    onChange({...optie, keuzes: optie.keuzes.map((keuze, i) => (i === index ? {...keuze, [key]: value} : keuze))});
  };

  return (
    <li className='rounded-button bg-gray-50 p-3 space-y-3'>
      <div className='flex items-end gap-2'>
        <FormField label={`${label}: naam`} htmlFor={`${id}-naam`} className='flex-1' hint='Bijvoorbeeld Brood of Formaat.'>
          <Input
            id={`${id}-naam`}
            value={optie.naam}
            onChange={event => {
              onChange({...optie, naam: event.target.value});
            }}
          />
        </FormField>
        <button type='button' className={iconButton} aria-label={`${label} verwijderen`} onClick={onRemove}>
          <Trash2 className='w-4 h-4' aria-hidden='true' />
        </button>
      </div>
      <ul className='space-y-2' aria-label={`Keuzes bij ${optie.naam || label}`}>
        {optie.keuzes.map((keuze, index) => {
          const keuzeLabel = `${label}, keuze ${index + 1}`;
          return (
            // Rows have no stable id; the index is the identity while editing
            <li key={index} className='grid grid-cols-[1fr_7rem_auto] gap-2 items-center'>
              <Input
                aria-label={`${keuzeLabel}: naam`}
                placeholder='Bijvoorbeeld Glutenvrij'
                value={keuze.naam}
                onChange={event => {
                  setKeuze(index, 'naam', event.target.value);
                }}
              />
              <Input
                aria-label={`${keuzeLabel}: meerprijs in euro`}
                placeholder='+ 0,00'
                inputMode='decimal'
                value={keuze.meerprijs}
                onChange={event => {
                  setKeuze(index, 'meerprijs', event.target.value);
                }}
              />
              <button
                type='button'
                className={iconButton}
                aria-label={`${keuzeLabel} verwijderen`}
                onClick={() => {
                  onChange({...optie, keuzes: optie.keuzes.filter((_, i) => i !== index)});
                }}
              >
                <X className='w-4 h-4' aria-hidden='true' />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type='button'
        className={smallButton}
        onClick={() => {
          onChange({...optie, keuzes: [...optie.keuzes, {naam: '', meerprijs: ''}]});
        }}
      >
        <Plus className='w-4 h-4' aria-hidden='true' />
        Keuze toevoegen
      </button>
    </li>
  );
}

function ProductEditor({product, index, total, invalid, onChange, onMove, onRemove}: Readonly<{
  product: ProductRij;
  index: number;
  total: number;
  invalid: boolean;
  onChange: (product: ProductRij) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
}>) {
  const id = useId();
  const label = `Product ${index + 1}`;
  const set = (key: 'naam' | 'info' | 'prijs' | 'voorraad' | 'maxPerBestelling', value: string) => {
    onChange({...product, [key]: value});
  };

  return (
    <li className='rounded-card border border-gray-200 p-4 space-y-4'>
      <div className='flex items-center justify-between gap-2'>
        <h3 className='font-semibold text-gray-800'>{product.naam.trim() || label}</h3>
        <div className='flex'>
          <button type='button' className={iconButton} aria-label={`${label} omhoog`} disabled={index === 0} onClick={() => {
            onMove(-1);
          }}>
            <ArrowUp className='w-4 h-4' aria-hidden='true' />
          </button>
          <button type='button' className={iconButton} aria-label={`${label} omlaag`} disabled={index === total - 1} onClick={() => {
            onMove(1);
          }}>
            <ArrowDown className='w-4 h-4' aria-hidden='true' />
          </button>
          <button type='button' className={iconButton} aria-label={`${label} verwijderen`} onClick={onRemove}>
            <Trash2 className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-[2fr_1fr]'>
        <FormField label='Naam' htmlFor={`${id}-naam`} required>
          <Input
            id={`${id}-naam`}
            value={product.naam}
            error={invalid}
            aria-invalid={invalid ? true : undefined}
            onChange={event => {
              set('naam', event.target.value);
            }}
          />
        </FormField>
        <FormField label='Prijs in euro' htmlFor={`${id}-prijs`} required hint='Bijvoorbeeld 12,50.'>
          <Input
            id={`${id}-prijs`}
            inputMode='decimal'
            value={product.prijs}
            onChange={event => {
              set('prijs', event.target.value);
            }}
          />
        </FormField>
        <FormField label='Info' htmlFor={`${id}-info`} hint='Optioneel: wat erin zit, bijvoorbeeld Tomaat, mozzarella, basilicum.' className='sm:col-span-2'>
          <Input
            id={`${id}-info`}
            value={product.info}
            onChange={event => {
              set('info', event.target.value);
            }}
          />
        </FormField>
        <FormField label='Voorraad' htmlFor={`${id}-voorraad`} hint='Leeg laten betekent onbeperkt.'>
          <Input
            id={`${id}-voorraad`}
            inputMode='numeric'
            value={product.voorraad}
            onChange={event => {
              set('voorraad', event.target.value);
            }}
          />
        </FormField>
        <FormField label='Maximum per bestelling' htmlFor={`${id}-max`} hint='Leeg laten betekent 10.'>
          <Input
            id={`${id}-max`}
            inputMode='numeric'
            value={product.maxPerBestelling}
            onChange={event => {
              set('maxPerBestelling', event.target.value);
            }}
          />
        </FormField>
      </div>

      <div className='space-y-2'>
        <p className='text-sm font-medium text-gray-700'>Opties</p>
        <p className='text-sm text-gray-500'>
          Optioneel. Ouders kiezen per stuk, bijvoorbeeld Brood: Wit, Bruin of Glutenvrij (+ 2,00).
        </p>
        {product.opties.length > 0 && (
          <ol className='space-y-3'>
            {product.opties.map((optie, optieIndex) => (
              <OptieEditor
                // Rows have no stable id; the index is the identity while editing
                key={optieIndex}
                optie={optie}
                label={`${label}, optie ${optieIndex + 1}`}
                onChange={next => {
                  onChange({...product, opties: product.opties.map((item, i) => (i === optieIndex ? next : item))});
                }}
                onRemove={() => {
                  onChange({...product, opties: product.opties.filter((_, i) => i !== optieIndex)});
                }}
              />
            ))}
          </ol>
        )}
        <button
          type='button'
          className={smallButton}
          onClick={() => {
            onChange({...product, opties: [...product.opties, {id: '', naam: '', keuzes: [{naam: '', meerprijs: ''}]}]});
          }}
        >
          <Plus className='w-4 h-4' aria-hidden='true' />
          Optie toevoegen
        </button>
      </div>
    </li>
  );
}

/**
 * The products of a sale, each with name, price, optional stock and options with choices.
 * The rows travel to the server as JSON in one hidden field; the schema validates them there.
 */
export function ProductenField({initial, error}: Readonly<Properties>) {
  const id = useId();
  const [rows, setRows] = useState<ProductRij[]>(() => {
    const parsed = leesProductRijen(initial);
    return parsed.length > 0 ? parsed : [legeProductRij()];
  });

  return (
    <fieldset className='space-y-3' aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}>
      <legend className='block text-sm font-medium text-gray-700'>Producten</legend>
      <p id={`${id}-hint`} className='text-sm text-gray-500'>
        Wat ouders kunnen bestellen. Een prijs van 0 kan ook, bijvoorbeeld voor een gratis inschrijving.
      </p>
      <input type='hidden' name='producten' value={JSON.stringify(rows)} />

      <ol className='space-y-4'>
        {rows.map((row, index) => (
          <ProductEditor
            // Rows have no stable id while new; the index is the identity while editing
            key={index}
            product={row}
            index={index}
            total={rows.length}
            invalid={Boolean(error) && index === 0}
            onChange={next => {
              setRows(previous => previous.map((item, i) => (i === index ? next : item)));
            }}
            onMove={offset => {
              setRows(previous => move(previous, index, offset));
            }}
            onRemove={() => {
              setRows(previous => previous.filter((_, i) => i !== index));
            }}
          />
        ))}
      </ol>

      {error && <p id={`${id}-error`} className='text-sm text-red-600'>{error}</p>}

      <button
        type='button'
        className={secondaryButton}
        onClick={() => {
          setRows(previous => [...previous, legeProductRij()]);
        }}
      >
        <Plus className='w-4 h-4' aria-hidden='true' />
        Product toevoegen
      </button>
    </fieldset>
  );
}
