'use client';

import {useActionState, useRef, useState} from 'react';
import Link from 'next/link';
import {Save} from 'lucide-react';
import {FormField, Input, Select, Switch} from '@components/ui';
import {announcementTypes} from '@lib/content-store/entry-types';
import {saveAnnouncement, type FormState} from '../../../(admin)/admin/(protected)/content/actions';
import {primaryButton, secondaryButton} from './styles';
import {useFormFeedback} from './use-form-feedback';

export type AnnouncementInitial = {
  actief: boolean;
  tekst: string;
  type: string;
  link: string;
  linkTekst: string;
};

type Properties = {
  initial: AnnouncementInitial;
  sha: string;
  action?: (state: FormState, data: FormData) => Promise<FormState>;
};

export function AnnouncementForm({initial, sha, action = saveAnnouncement}: Readonly<Properties>) {
  const attempts = useRef(0);
  const wrapped = async (previous: FormState & {attempt?: number}, data: FormData) => {
    const result = await action(previous, data);
    attempts.current += 1;
    return {...result, attempt: attempts.current};
  };

  const [state, formAction, pending] = useActionState(wrapped, {} as FormState & {attempt?: number});
  const [values, setValues] = useState(initial);
  const errors = state.errors ?? {};
  const {formRef, messageRef, message} = useFormFeedback(state, ['tekst', 'type', 'link', 'linkTekst']);
  const set = <K extends keyof AnnouncementInitial>(key: K, value: AnnouncementInitial[K]) => {
    setValues(previous => ({...previous, [key]: value}));
  };

  return (
    <form ref={formRef} action={formAction} className='space-y-6 bg-white rounded-card shadow-base p-4 sm:p-6' noValidate>
      {message && (
        <p ref={messageRef} tabIndex={-1} role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-600'>{message}</p>
      )}
      <input type='hidden' name='_sha' value={sha} />
      <Switch
        label='Aankondiging tonen'
        description='Toont de balk bovenaan de site.'
        name='actief'
        checked={values.actief}
        onChange={event => {
          set('actief', event.target.checked);
        }}
      />
      <FormField label='Tekst' htmlFor='tekst' error={errors.tekst} required={values.actief}>
        <Input
          id='tekst'
          name='tekst'
          value={values.tekst}
          error={Boolean(errors.tekst)}
          aria-invalid={errors.tekst ? true : undefined}
          onChange={event => {
            set('tekst', event.target.value);
          }}
        />
      </FormField>
      <FormField label='Soort' htmlFor='type' error={errors.type}>
        <Select
          id='type'
          name='type'
          options={announcementTypes}
          value={values.type}
          onChange={event => {
            set('type', event.target.value);
          }}
        />
      </FormField>
      <div className='grid gap-4 sm:grid-cols-2'>
        <FormField label='Link' htmlFor='link' error={errors.link} hint='Begin met https:// (of met / voor een pagina op deze site).'>
          <Input
            id='link'
            name='link'
            value={values.link}
            error={Boolean(errors.link)}
            aria-invalid={errors.link ? true : undefined}
            onChange={event => {
              set('link', event.target.value);
            }}
          />
        </FormField>
        <FormField label='Tekst van de link' htmlFor='linkTekst' error={errors.linkTekst}>
          <Input
            id='linkTekst'
            name='linkTekst'
            value={values.linkTekst}
            error={Boolean(errors.linkTekst)}
            aria-invalid={errors.linkTekst ? true : undefined}
            onChange={event => {
              set('linkTekst', event.target.value);
            }}
          />
        </FormField>
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' className={primaryButton} disabled={pending}>
          <Save className='w-4 h-4' aria-hidden='true' />
          {pending ? 'Bezig met opslaan…' : 'Opslaan'}
        </button>
        <Link href='/admin/content' className={secondaryButton}>Annuleren</Link>
      </div>
    </form>
  );
}
