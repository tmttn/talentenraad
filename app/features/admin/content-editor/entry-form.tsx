'use client';

import {useActionState, useRef, useState} from 'react';
import Link from 'next/link';
import {Save} from 'lucide-react';
import {FormField, Input, Select, Switch} from '@components/ui';
import {entryTypes, type EntryType} from '@lib/content-store/entry-types';
import {saveEntry, type FormState} from '../../../(admin)/admin/(protected)/content/actions';
import {ImageField} from './image-field';
import {MarkdownField} from './markdown-field';
import {ProgrammaField} from './programma-field';
import {primaryButton, secondaryButton} from './styles';
import {useFormFeedback} from './use-form-feedback';

export type EntryFormInitial = {
  values: Record<string, string>;
  body: string;
  concept: boolean;
  aliases: string[];
  indexSha: string;
  imageSha: string;
};

type Properties = {
  type: EntryType;
  mode: 'create' | 'edit';
  slug?: string;
  initial?: EntryFormInitial;
  imageUrl?: string;
  action?: (state: FormState, data: FormData) => Promise<FormState>;
};

type State = FormState & {attempt?: number; lostPhoto?: boolean};

const emptyState: State = {};

export function EntryForm({
  type, mode, slug, initial, imageUrl, action = saveEntry,
}: Readonly<Properties>) {
  const config = entryTypes[type];
  const attempts = useRef(0);
  const pickedPhoto = useRef(false);
  const wrapped = async (previous: State, data: FormData): Promise<State> => {
    const hadPhoto = pickedPhoto.current;
    pickedPhoto.current = false; // the field remounts (and forgets the file) after every submit
    const result = await action(previous, data);
    attempts.current += 1;
    return {...result, attempt: attempts.current, lostPhoto: hadPhoto};
  };

  const [state, formAction, pending] = useActionState(wrapped, emptyState);
  const [removeImage, setRemoveImage] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(initial?.values ?? {});
  const [body, setBody] = useState(initial?.body ?? '');
  const [concept, setConcept] = useState(initial?.concept ?? false);
  const errors = state.errors ?? {};
  const visible = [
    ...config.fields.map(field => field.name),
    config.bodyField,
    ...(config.imageField ? [config.imageField] : []),
    ...(config.listField ? [config.listField] : []),
  ];
  const {formRef, messageRef, message} = useFormFeedback(state, visible);

  const set = (name: string, value: string) => {
    setValues(previous => ({...previous, [name]: value}));
  };

  return (
    <form ref={formRef} action={formAction} className='space-y-6 bg-white rounded-card shadow-base p-4 sm:p-6' noValidate>
      {message && (
        <p ref={messageRef} tabIndex={-1} role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-600'>
          {message}
        </p>
      )}
      <input type='hidden' name='_type' value={type} />
      <input type='hidden' name='_mode' value={mode} />
      {mode === 'edit' && (
        <>
          <input type='hidden' name='_slug' value={slug ?? ''} />
          <input type='hidden' name='_indexSha' value={initial?.indexSha ?? ''} />
          <input type='hidden' name='_imageSha' value={initial?.imageSha ?? ''} />
          <input type='hidden' name='_hasImage' value={imageUrl ? '1' : ''} />
        </>
      )}

      <div className='grid gap-4 sm:grid-cols-2'>
        {config.fields.map(field => (
          <FormField
            key={field.name}
            label={field.label}
            htmlFor={field.name}
            required={field.required}
            error={errors[field.name]}
            hint={field.hint}
            className={field.name === 'titel' || field.name === 'samenvatting' || field.name === 'vraag' ? 'sm:col-span-2' : ''}
          >
            {field.kind === 'select'
              ? (
                <Select
                  id={field.name}
                  name={field.name}
                  options={field.options ?? []}
                  placeholder='Kies een optie'
                  value={values[field.name] ?? ''}
                  error={Boolean(errors[field.name])}
                  aria-invalid={errors[field.name] ? true : undefined}
                  onChange={event => {
                    set(field.name, event.target.value);
                  }}
                />
              )
              : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.kind === 'text' ? 'text' : field.kind}
                  value={values[field.name] ?? ''}
                  error={Boolean(errors[field.name])}
                  aria-invalid={errors[field.name] ? true : undefined}
                  onChange={event => {
                    set(field.name, event.target.value);
                  }}
                />
              )}
          </FormField>
        ))}
      </div>

      {config.listField && (
        // No remount key: unlike the photo, the rows survive a failed save
        <ProgrammaField
          name={config.listField}
          initial={values[config.listField]}
          error={errors[config.listField]}
        />
      )}

      <MarkdownField
        name={config.bodyField}
        label={config.bodyLabel}
        value={body}
        onChange={setBody}
        error={errors[config.bodyField]}
        required={type === 'faq'}
      />

      {config.imageField && (
        <ImageField
          key={state.attempt ?? 0}
          lostPhoto={state.lostPhoto && Boolean(state.errors ?? state.message)}
          remove={removeImage}
          onRemoveChange={setRemoveImage}
          onPickedChange={picked => {
            pickedPhoto.current = picked;
          }}
          name={config.imageField}
          label={config.imageField === 'foto' ? 'Foto' : 'Afbeelding'}
          currentUrl={imageUrl}
          error={errors[config.imageField]}
        />
      )}

      {(
        <Switch
          label='Concept'
          description='Een concept staat niet op de site.'
          name='concept'
          checked={concept}
          onChange={event => {
            setConcept(event.target.checked);
          }}
        />
      )}

      <div className='flex flex-wrap items-center gap-3'>
        <button type='submit' className={primaryButton} disabled={pending}>
          <Save className='w-4 h-4' aria-hidden='true' />
          {pending ? 'Bezig met opslaan…' : 'Opslaan'}
        </button>
        <Link href={`/admin/content/${type}`} className={secondaryButton}>Annuleren</Link>
      </div>
    </form>
  );
}
