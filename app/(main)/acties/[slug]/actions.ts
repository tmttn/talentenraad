'use server';

import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {bestelMeldingen, type BestelFouten} from '@lib/bestellingen/formulier';
import {bestelFormPurpose, plaatsBestelling} from '@lib/bestellingen/plaatsen';
import {content} from '@lib/content';
import {issueFormToken, minimumFillMs} from '@lib/form-timing';
import {getClientIp, rateLimitMessage} from '@lib/rate-limit';

export type BestelState = {
  status: 'idle' | 'spam' | 'error';
  /** Message for the whole form. */
  message?: string;
  fouten?: BestelFouten;
  /** What was sent, so a re-rendered form (also without JavaScript) keeps it. */
  values?: Record<string, string>;
  /** A fresh timing token when the old one ran out. */
  formToken?: string;
};

const stringValues = (data: FormData): Record<string, string> => {
  const values: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === 'string' && !key.startsWith('$') && key !== 'website' && key !== 'formToken') {
      values[key] = value;
    }
  }

  return values;
};

const geslotenMeldingen = {
  binnenkort: 'Bestellen kan nog niet. Kom terug zodra de bestelperiode begint.',
  gesloten: bestelMeldingen.gesloten,
  voorbeeldrekening: 'Bestellen kan binnenkort.',
  concept: 'Bestellen kan binnenkort.',
};

export async function bestel(_previous: BestelState, data: FormData): Promise<BestelState> {
  const values = stringValues(data);
  const actie = content.getActie(values.actie ?? '');
  if (!actie) {
    return {status: 'error', message: bestelMeldingen.gewijzigd, values};
  }

  const result = await plaatsBestelling(actie, content.getSite().bestellingen.rekening.iban, {
    data,
    website: typeof data.get('website') === 'string' ? data.get('website') as string : undefined,
    formToken: typeof data.get('formToken') === 'string' ? data.get('formToken') as string : undefined,
  }, getClientIp(await headers() as unknown as Headers));

  switch (result.status) {
    case 'besteld': {
      redirect(`/b/${result.token}?besteld=1`);
    }

    case 'spam': {
      return {status: 'spam'};
    }

    case 'ongeldig': {
      return {status: 'error', message: bestelMeldingen.ongeldig, fouten: result.fouten, values};
    }

    case 'uitverkocht': {
      return {status: 'error', message: bestelMeldingen.uitverkocht, fouten: result.fouten, values};
    }

    case 'gesloten': {
      return {status: 'error', message: geslotenMeldingen[result.reden], values};
    }

    case 'gewijzigd': {
      return {status: 'error', message: bestelMeldingen.gewijzigd, values};
    }

    case 'beperkt': {
      return {status: 'error', message: rateLimitMessage.replace('berichten', 'bestellingen'), values};
    }

    case 'verlopen': {
      // Dated back by the minimum fill time: this person already filled in the form and may resend at once
      return {status: 'error', message: bestelMeldingen.verlopen, values, formToken: issueFormToken(bestelFormPurpose, Date.now() - minimumFillMs)};
    }

    default: {
      return {status: 'error', message: bestelMeldingen.mislukt, values};
    }
  }
}
