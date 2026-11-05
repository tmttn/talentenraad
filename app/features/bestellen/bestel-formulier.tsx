'use client';

import {
  useActionState, useEffect, useMemo, useRef, useState, type ReactNode, type SyntheticEvent,
} from 'react';
import Link from 'next/link';
import {ArrowRight, Loader2, XCircle} from 'lucide-react';
import {SpeechBubble} from '@components/ui';
import {HoneypotField} from '@components/ui/honeypot-field';
import {productVarianten, veldnaam} from '@lib/bestellingen/acties';
import {
  bestelMeldingen, controleerBestelling, leesBestelFormulier, type BestelFouten,
} from '@lib/bestellingen/formulier';
import {formatEuro} from '@lib/bestellingen/geld';
import type {ActieFrontmatter, Betaalwijze} from '@lib/content/schemas';
import {bestel, type BestelState} from '../../(main)/acties/[slug]/actions';
import {AantalKiezer} from './aantal-kiezer';

export type BestelActie = Pick<ActieFrontmatter, 'producten' | 'afhalen' | 'vraag'> & {
  slug: string;
  wijzen: Betaalwijze[];
  /** Label per pickup moment (`Vrijdag 22 januari, 17:00 - 19:00`), by id. */
  afhaalLabels: Record<string, string>;
};

type Properties = {
  actie: BestelActie;
  /** Pieces left per product with a stock; products without stock are missing. */
  over: Record<string, number>;
  formToken: string;
  /** For tests; the page uses the real server action. */
  action?: (state: BestelState, data: FormData) => Promise<BestelState>;
};

const initialState: BestelState = {status: 'idle'};

const labelClass = 'font-bold text-[15px] text-gray-900';
const inputClass = [
  'w-full px-3.5 py-3 text-[17px] text-gray-900 bg-white rounded-control',
  'border-(length:--contour-width-sm) border-ink transition-colors',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
].join(' ');
const inputErrorClass = 'border-red-700 bg-red-50';
const errorClass = 'text-sm font-semibold text-red-700';

function Field({id, label, error, children}: Readonly<{id: string; label: ReactNode; error?: string; children: (describedBy: string | undefined) => ReactNode}>) {
  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={id} className={labelClass}>{label}</label>
      {children(error ? `${id}-fout` : undefined)}
      {error && <p id={`${id}-fout`} className={errorClass}>{error}</p>}
    </div>
  );
}

const betaalZin = (wijzen: Betaalwijze[]) => {
  const hoe = wijzen.includes('overschrijving') && wijzen.includes('cash')
    ? 'per overschrijving of cash'
    : (wijzen.includes('cash') ? 'cash' : 'per overschrijving');
  return `Je betaalt daarna ${hoe}; de gegevens krijg je meteen per mail. Je QR-code om af te halen volgt zodra je betaling binnen is.`;
};

const startAantallen = (values: Record<string, string> | undefined) => {
  const aantallen: Record<string, number> = {};
  for (const [key, value] of Object.entries(values ?? {})) {
    const parsed = Number.parseInt(value, 10);
    if (key.startsWith('aantal:') && parsed > 0) {
      aantallen[key] = parsed;
    }
  }

  return aantallen;
};

/**
 * The order form: products with quantities on the left, the summary and the parent's details on
 * a contour panel on the right. A server action does the real work, so it also works without
 * JavaScript; with JavaScript the browser checks first and keeps the page.
 */
export function BestelFormulier({
  actie, over, formToken, action = bestel,
}: Readonly<Properties>) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [aantallen, setAantallen] = useState<Record<string, number>>(() => startAantallen(state.values));
  const [clientFouten, setClientFouten] = useState<BestelFouten | undefined>();
  const formRef = useRef<HTMLFormElement>(null);

  const fouten: BestelFouten = clientFouten ?? (state.status === 'error' ? state.fouten ?? {} : {});
  const values = state.values;

  const producten = useMemo(() => actie.producten.map(product => {
    const varianten = productVarianten(product).map(variant => ({...variant, veld: veldnaam(product.id, variant.sleutel)}));
    const limiet = Math.min(product.maxPerBestelling, over[product.id] ?? Number.POSITIVE_INFINITY);
    return {product, varianten, limiet, uitverkocht: over[product.id] === 0};
  }), [actie.producten, over]);

  const regels = producten.flatMap(({product, varianten}) => varianten
    .filter(variant => (aantallen[variant.veld] ?? 0) > 0)
    .map(variant => ({
      veld: variant.veld,
      tekst: `${aantallen[variant.veld]} × ${product.naam}${variant.label ? ` (${variant.label.toLowerCase()})` : ''}`,
      bedrag: (aantallen[variant.veld] ?? 0) * variant.prijs,
    })));
  const totaal = regels.reduce((sum, regel) => sum + regel.bedrag, 0);

  useEffect(() => {
    if (state.status === 'error') {
      const form = formRef.current;
      (form?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? form?.querySelector<HTMLElement>('[role="alert"]'))?.focus();
    }
  }, [state]);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const {invoer, fouten: leesFouten} = leesBestelFormulier(actie, new FormData(form));
    const found = {...controleerBestelling(actie, invoer), ...leesFouten};
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      setClientFouten(found);
      requestAnimationFrame(() => {
        (form.querySelector<HTMLElement>('[aria-invalid="true"]') ?? form.querySelector<HTMLElement>('[role="alert"]'))?.focus();
      });
      return;
    }

    setClientFouten(undefined);
  };

  const clear = (key: keyof BestelFouten) => () => {
    if (clientFouten?.[key]) {
      setClientFouten(previous => {
        const next = {...previous};
        delete next[key];
        return next;
      });
    }
  };

  if (state.status === 'spam') {
    return (
      <div role='status' className='max-w-[640px]'>
        <SpeechBubble tone='green' tail='bottom' size='md'>
          <h2 className='mb-2 font-display font-extrabold text-black text-3xl leading-tight'>Bedankt voor je bestelling!</h2>
          <p className='text-[17px] text-black'>Je krijgt zo een mail met je bestelling en hoe je betaalt.</p>
        </SpeechBubble>
      </div>
    );
  }

  const heeftFouten = Object.keys(fouten).length > 0;
  const melding = state.status === 'error' && (!state.fouten || clientFouten === undefined) ? state.message : (heeftFouten ? bestelMeldingen.ongeldig : undefined);
  const invalid = (key: keyof BestelFouten) => (fouten[key] ? true : undefined);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      aria-label='Bestellen'
      className='flex flex-wrap gap-[clamp(28px,4vw,48px)] items-start'
    >
      <input type='hidden' name='actie' value={actie.slug} />
      <input type='hidden' name='formToken' value={state.formToken ?? formToken} />
      <HoneypotField id='bestel-website' />

      <div className='flex-[999_1_560px] min-w-0 flex flex-col gap-5'>
        <h2 className='font-display font-extrabold text-black text-[28px]'>Kies wat je bestelt</h2>
        {fouten.producten && <p id='producten-fout' className={errorClass}>{fouten.producten}</p>}
        <ul className='flex flex-col gap-5'>
          {producten.map(({product, varianten, limiet, uitverkocht}) => {
            const stuks = varianten.reduce((sum, variant) => sum + (aantallen[variant.veld] ?? 0), 0);
            const fout = fouten[`product:${product.id}`];
            const foutId = `product-${product.id}-fout`;
            return (
              <li
                key={product.id}
                className={`bg-white rounded-tile contour-sm px-[22px] py-5 flex flex-col gap-4 ${stuks > 0 ? 'shadow-hard-md' : ''} ${fout ? 'border-red-700' : ''}`}
              >
                <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
                  <div className='flex flex-col gap-1 min-w-0'>
                    <h3 className='font-display font-bold text-2xl text-black'>{product.naam}</h3>
                    {product.info && <p className='text-[15px] text-gray-600'>{product.info}</p>}
                  </div>
                  {varianten.length === 1 && <span className='text-xl font-extrabold text-black'>{formatEuro(product.prijs)}</span>}
                </div>
                {uitverkocht
                  ? <p className='self-start rounded-full contour-xs bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700'>Uitverkocht</p>
                  : (
                    <ul className='flex flex-col gap-3'>
                      {varianten.map(variant => {
                        const label = variant.label ? `${product.naam} ${variant.label.toLowerCase()}` : product.naam;
                        const waarde = aantallen[variant.veld] ?? 0;
                        return (
                          <li key={variant.veld} className='flex flex-wrap items-center justify-between gap-3'>
                            {variant.label !== '' && (
                              <span className='font-semibold text-gray-900'>
                                {variant.label}
                                <span className='ml-2 font-bold text-black'>{formatEuro(variant.prijs)}</span>
                              </span>
                            )}
                            <span className={variant.label === '' ? 'ml-auto' : ''}>
                              <AantalKiezer
                                name={variant.veld}
                                label={label}
                                value={waarde}
                                max={Math.max(0, limiet - (stuks - waarde))}
                                invalid={Boolean(fout)}
                                describedBy={fout ? foutId : undefined}
                                onChange={next => {
                                  setAantallen(previous => ({...previous, [variant.veld]: next}));
                                  clear(`product:${product.id}`)();
                                  clear('producten')();
                                }}
                              />
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                {over[product.id] !== undefined && over[product.id] > 0 && over[product.id] <= 10 && (
                  <p className='text-sm font-semibold text-gray-700'>Nog {over[product.id]} over.</p>
                )}
                {fout && <p id={foutId} className={errorClass}>{fout}</p>}
              </li>
            );
          })}
        </ul>
        <p className='text-[15px] text-gray-600'>
          {[...new Set(actie.producten.map(product => product.maxPerBestelling))].length === 1
            ? `Maximaal ${actie.producten[0].maxPerBestelling} per product.`
            : 'Per product geldt een maximum per bestelling.'}
        </p>
      </div>

      <div className='flex-[1_1_360px] min-w-0 bg-white rounded-panel contour shadow-hard-lg p-7 flex flex-col gap-5'>
        <h2 className='font-display font-extrabold text-black text-[26px]'>Je bestelling</h2>

        {melding && (
          <p
            role='alert'
            tabIndex={-1}
            className='flex items-center gap-2 p-4 rounded-control border-(length:--contour-width-sm) border-red-700 bg-red-50 font-semibold text-red-700 focus:outline-none'
          >
            <XCircle className='h-5 w-5 shrink-0' aria-hidden='true' />
            {melding}
          </p>
        )}

        <div aria-live='polite' className='flex flex-col gap-2'>
          {regels.length === 0
            ? <p className='text-gray-600'>Nog niets gekozen.</p>
            : regels.map(regel => (
              <p key={regel.veld} className='flex justify-between gap-3 text-gray-900'>
                <span>{regel.tekst}</span>
                <span className='font-bold whitespace-nowrap'>{formatEuro(regel.bedrag)}</span>
              </p>
            ))}
          <p className='flex justify-between items-baseline pt-3 mt-1 border-t-2 border-ink'>
            <span className='font-bold text-[17px]'>Totaal</span>
            <span className='font-display font-extrabold text-[30px] text-black'>{formatEuro(totaal)}</span>
          </p>
        </div>

        <fieldset aria-describedby={fouten.afhaalId ? 'afhaal-fout' : undefined} className='flex flex-col gap-2.5'>
          <legend className={`${labelClass} mb-2.5`}>Wanneer haal je af?</legend>
          {actie.afhalen.map((moment, index) => (
            <label
              key={moment.id}
              className={[
                'flex items-start gap-2.5 px-3.5 py-3 font-semibold text-black bg-white rounded-control contour-xs cursor-pointer',
                'has-[:checked]:bg-brand-primary-50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-focus has-[:focus-visible]:ring-offset-2',
                fouten.afhaalId ? 'border-red-700' : '',
              ].join(' ')}
            >
              <input
                type='radio'
                name='afhaalId'
                value={moment.id}
                defaultChecked={(values?.afhaalId ?? (actie.afhalen.length === 1 ? moment.id : '')) === moment.id}
                aria-invalid={fouten.afhaalId && index === 0 ? true : undefined}
                onChange={clear('afhaalId')}
                className='mt-1 accent-primary focus:outline-none'
              />
              <span className='flex flex-col'>
                {actie.afhaalLabels[moment.id]}
                <span className='text-sm font-normal text-gray-700'>{moment.plaats}</span>
              </span>
            </label>
          ))}
          {fouten.afhaalId && <p id='afhaal-fout' className={errorClass}>{fouten.afhaalId}</p>}
        </fieldset>

        <Field id='b-naam' label='Naam' error={fouten.naam}>
          {describedBy => (
            <input id='b-naam' name='naam' type='text' autoComplete='name' required defaultValue={values?.naam}
              aria-invalid={invalid('naam')} aria-describedby={describedBy} onChange={clear('naam')}
              className={`${inputClass} ${fouten.naam ? inputErrorClass : ''}`} />
          )}
        </Field>
        <Field id='b-email' label={<>E-mail <span className='font-medium text-gray-600'>(hier komt je QR-code)</span></>} error={fouten.email}>
          {describedBy => (
            <input id='b-email' name='email' type='email' autoComplete='email' required defaultValue={values?.email}
              aria-invalid={invalid('email')} aria-describedby={describedBy} onChange={clear('email')}
              className={`${inputClass} ${fouten.email ? inputErrorClass : ''}`} />
          )}
        </Field>
        <Field id='b-telefoon' label={<>Telefoon <span className='font-medium text-gray-600'>(niet verplicht)</span></>} error={fouten.telefoon}>
          {describedBy => (
            <input id='b-telefoon' name='telefoon' type='tel' autoComplete='tel' defaultValue={values?.telefoon}
              aria-invalid={invalid('telefoon')} aria-describedby={describedBy} onChange={clear('telefoon')}
              className={`${inputClass} ${fouten.telefoon ? inputErrorClass : ''}`} />
          )}
        </Field>
        {actie.vraag.kind && (
          <>
            <Field id='b-kind' label='Naam van je kind' error={fouten.kindNaam}>
              {describedBy => (
                <input id='b-kind' name='kindNaam' type='text' defaultValue={values?.kindNaam}
                  aria-invalid={invalid('kindNaam')} aria-describedby={describedBy} onChange={clear('kindNaam')}
                  className={`${inputClass} ${fouten.kindNaam ? inputErrorClass : ''}`} />
              )}
            </Field>
            <Field id='b-klas' label='Klas' error={fouten.kindKlas}>
              {describedBy => (
                <input id='b-klas' name='kindKlas' type='text' defaultValue={values?.kindKlas}
                  aria-invalid={invalid('kindKlas')} aria-describedby={describedBy} onChange={clear('kindKlas')}
                  className={`${inputClass} ${fouten.kindKlas ? inputErrorClass : ''}`} />
              )}
            </Field>
          </>
        )}

        <button
          type='submit'
          disabled={pending}
          className={[
            'inline-flex justify-center items-center gap-2.5 px-6 py-3.5 text-lg font-bold text-white bg-primary rounded-control',
            'contour-sm shadow-hard-sm hover:bg-primary-hover active:translate-x-1 active:translate-y-1 active:shadow-none',
            'disabled:opacity-60 disabled:cursor-not-allowed transition',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2',
          ].join(' ')}
        >
          {pending
            ? <><Loader2 className='animate-spin h-5 w-5' aria-hidden='true' />Bezig met bestellen…</>
            : <>Bestellen<ArrowRight className='h-5 w-5' strokeWidth={2.5} aria-hidden='true' /></>}
        </button>
        <p className='text-sm leading-normal text-gray-600'>
          {betaalZin(actie.wijzen)} We gebruiken je gegevens alleen voor deze bestelling; meer in ons{' '}
          <Link href='/privacybeleid' className='text-primary-text underline underline-offset-2'>privacybeleid</Link>.
        </p>
      </div>
    </form>
  );
}
