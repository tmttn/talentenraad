'use client';

import {
  useActionState, useState, type ReactNode, type SyntheticEvent,
} from 'react';
import {Loader2} from 'lucide-react';
import {formatEuro} from '@lib/bestellingen/geld';
import type {BestelFouten} from '@lib/bestellingen/formulier';
import {primaryButton} from '@features/admin/content-editor/styles';

export type HandmatigState = {
  status: 'idle' | 'fout';
  melding?: string;
  fouten?: BestelFouten;
  /** What was sent, so the form keeps it after an error. */
  waarden?: Record<string, string>;
  /** Changes with every answer, so the form shows the kept values again. */
  poging?: number;
};

export type HandmatigeActie = {
  slug: string;
  vraagKind: boolean;
  afhalen: Array<{id: string; label: string}>;
  producten: Array<{
    id: string;
    naam: string;
    max: number;
    /** Pieces left; undefined when the product has no stock limit. */
    over?: number;
    varianten: Array<{veld: string; label: string; prijs: number}>;
  }>;
};

type Properties = {
  actie: HandmatigeActie;
  /** May confirm a cash payment: only with access to the bank account. */
  magCash: boolean;
  action: (state: HandmatigState, data: FormData) => Promise<HandmatigState>;
};

const controlBase = 'rounded-input border border-gray-300 bg-white px-3 py-2.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none';
const control = `w-full ${controlBase}`;
const errorControl = 'border-red-600 bg-red-50';
const label = 'block text-sm font-semibold text-gray-700';
const foutTekst = 'text-sm font-medium text-red-700';

function Veld({id, titel, fout, hint, children}: Readonly<{id: string; titel: string; fout?: string; hint?: string; children: (describedBy?: string) => ReactNode}>) {
  const describedBy = [fout ? `${id}-fout` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className='space-y-1.5'>
      <label htmlFor={id} className={label}>{titel}</label>
      {children(describedBy)}
      {hint && <p id={`${id}-hint`} className='text-sm text-gray-600'>{hint}</p>}
      {fout && <p id={`${id}-fout`} className={foutTekst}>{fout}</p>}
    </div>
  );
}

const totaalVan = (actie: HandmatigeActie, lees: (veld: string) => string) => actie.producten
  .flatMap(product => product.varianten)
  .reduce((total, variant) => {
    const aantal = Number(lees(variant.veld));
    return total + (Number.isInteger(aantal) && aantal > 0 ? aantal * variant.prijs : 0);
  }, 0);

/** The admin form for an order the board enters; the server checks everything again. */
export function HandmatigeBestelling({actie, magCash, action}: Readonly<Properties>) {
  const [state, formAction, pending] = useActionState(action, {status: 'idle'});
  const waarden = state.waarden ?? {};
  const fouten = state.fouten ?? {};
  const [totaal, setTotaal] = useState(() => totaalVan(actie, veld => waarden[veld] ?? ''));
  const opnieuw = (data: FormData) => setTotaal(totaalVan(actie, veld => String(data.get(veld) ?? '')));
  const fieldClass = (fout?: string, breedte = 'w-full') => `${breedte} ${controlBase}${fout ? ` ${errorControl}` : ''}`;

  return (
    // A new key after every answer: the fields show what was sent again instead of being emptied
    <form
      key={state.poging ?? 0}
      action={formAction}
      onInput={(event: SyntheticEvent<HTMLFormElement>) => opnieuw(new FormData(event.currentTarget))}
      className='bg-white rounded-card shadow-base p-5 sm:p-6 space-y-5'
      noValidate
    >
      <input type='hidden' name='actie' value={actie.slug} />

      {state.melding && (
        <p role='alert' className='rounded-input border border-red-200 bg-red-50 px-3 py-2.5 text-red-800 font-medium'>{state.melding}</p>
      )}

      <Veld id='naam' titel='Naam' fout={fouten.naam}>
        {describedBy => <input id='naam' name='naam' type='text' required maxLength={100} autoComplete='off' defaultValue={waarden.naam} aria-invalid={Boolean(fouten.naam)} aria-describedby={describedBy} className={fieldClass(fouten.naam)} />}
      </Veld>

      <div className='grid gap-5 sm:grid-cols-2'>
        <Veld id='email' titel='E-mail (niet verplicht)' fout={fouten.email} hint='Ingevuld: de ouder krijgt de gewone mails.'>
          {describedBy => <input id='email' name='email' type='email' maxLength={200} autoComplete='off' defaultValue={waarden.email} aria-invalid={Boolean(fouten.email)} aria-describedby={describedBy} className={fieldClass(fouten.email)} />}
        </Veld>
        <Veld id='telefoon' titel='Telefoon (niet verplicht)' fout={fouten.telefoon}>
          {describedBy => <input id='telefoon' name='telefoon' type='tel' maxLength={25} autoComplete='off' defaultValue={waarden.telefoon} aria-invalid={Boolean(fouten.telefoon)} aria-describedby={describedBy} className={fieldClass(fouten.telefoon)} />}
        </Veld>
      </div>

      {actie.vraagKind && (
        <div className='grid gap-5 sm:grid-cols-[2fr_1fr]'>
          <Veld id='kindNaam' titel='Naam van het kind' fout={fouten.kindNaam}>
            {describedBy => <input id='kindNaam' name='kindNaam' type='text' maxLength={100} autoComplete='off' defaultValue={waarden.kindNaam} aria-invalid={Boolean(fouten.kindNaam)} aria-describedby={describedBy} className={fieldClass(fouten.kindNaam)} />}
          </Veld>
          <Veld id='kindKlas' titel='Klas' fout={fouten.kindKlas}>
            {describedBy => <input id='kindKlas' name='kindKlas' type='text' maxLength={40} autoComplete='off' defaultValue={waarden.kindKlas} aria-invalid={Boolean(fouten.kindKlas)} aria-describedby={describedBy} className={fieldClass(fouten.kindKlas)} />}
          </Veld>
        </div>
      )}

      <Veld id='afhaalId' titel='Afhaalmoment' fout={fouten.afhaalId}>
        {describedBy => (
          <select id='afhaalId' name='afhaalId' defaultValue={waarden.afhaalId ?? (actie.afhalen.length === 1 ? actie.afhalen[0].id : '')} aria-invalid={Boolean(fouten.afhaalId)} aria-describedby={describedBy} className={fieldClass(fouten.afhaalId)}>
            {actie.afhalen.length > 1 && <option value=''>Kies een moment</option>}
            {actie.afhalen.map(moment => <option key={moment.id} value={moment.id}>{moment.label}</option>)}
          </select>
        )}
      </Veld>

      <fieldset className='space-y-3'>
        <legend className={label}>Producten</legend>
        {fouten.producten && <p className={foutTekst}>{fouten.producten}</p>}
        {actie.producten.map(product => {
          const fout = fouten[`product:${product.id}`];
          return (
            <div key={product.id} className='rounded-input border border-gray-200 p-3 space-y-2'>
              <p className='font-semibold text-gray-800'>
                {product.naam}
                <span className='font-normal text-sm text-gray-600'>
                  {product.over === undefined ? '' : ` · nog ${product.over} over`} · max. {product.max} per bestelling
                </span>
              </p>
              {product.varianten.map(variant => (
                <div key={variant.veld} className='flex items-center justify-between gap-3'>
                  <label htmlFor={variant.veld} className='text-gray-700'>
                    {variant.label === '' ? 'Aantal' : variant.label}
                    <span className='text-gray-500'> · {formatEuro(variant.prijs)}</span>
                  </label>
                  <input
                    id={variant.veld}
                    name={variant.veld}
                    type='number'
                    inputMode='numeric'
                    min={0}
                    max={999}
                    defaultValue={waarden[variant.veld]}
                    placeholder='0'
                    aria-invalid={Boolean(fout)}
                    className={`${fieldClass(fout, 'w-24 shrink-0')} text-right`}
                  />
                </div>
              ))}
              {fout && <p className={foutTekst}>{fout}</p>}
            </div>
          );
        })}
      </fieldset>

      <Veld id='notitie' titel='Notitie (niet verplicht)' hint='Bijvoorbeeld: betaalt bij het afhalen.'>
        {describedBy => <textarea id='notitie' name='notitie' rows={2} maxLength={500} defaultValue={waarden.notitie} aria-describedby={describedBy} className={control} />}
      </Veld>

      {magCash && (
        <label className='flex items-start gap-3 rounded-input border border-gray-200 p-3'>
          <input type='checkbox' name='cash' defaultChecked={waarden.cash === 'on'} className='mt-1 h-5 w-5 accent-primary' />
          <span>
            <span className='block font-semibold text-gray-800'>Cash betaald</span>
            <span className='block text-sm text-gray-600'>Je hebt het geld nu ontvangen. De bestelling staat meteen op betaald, met jouw naam.</span>
          </span>
        </label>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4'>
        <p className='text-lg font-semibold text-gray-800' aria-live='polite'>Totaal: {formatEuro(totaal)}</p>
        <button type='submit' disabled={pending} className={primaryButton}>
          {pending && <Loader2 className='w-4 h-4 animate-spin' aria-hidden='true' />}
          Bestelling bewaren
        </button>
      </div>
    </form>
  );
}
