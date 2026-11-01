'use client';

import {useActionState, useEffect, useRef, useState} from 'react';
import {Trash2} from 'lucide-react';
import {deleteEntry, type FormState} from '../../../(admin)/admin/(protected)/content/actions';
import {dangerButton, dangerOutlineButton, secondaryButton} from './styles';

type Properties = {
  type: string;
  slug: string;
  title: string;
  indexSha: string;
  imageSha: string;
  action?: (state: FormState, data: FormData) => Promise<FormState>;
};

export function DeleteEntry({
  type, slug, title, indexSha, imageSha, action = deleteEntry,
}: Readonly<Properties>) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [confirming, setConfirming] = useState(false);
  const confirmation = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (confirming) {
      confirmation.current?.focus();
    }
  }, [confirming]);

  return (
    <form action={formAction} className='bg-white rounded-card shadow-base p-4 sm:p-6 space-y-3'>
      <input type='hidden' name='_type' value={type} />
      <input type='hidden' name='_slug' value={slug} />
      <input type='hidden' name='_title' value={title} />
      <input type='hidden' name='_indexSha' value={indexSha} />
      <input type='hidden' name='_imageSha' value={imageSha} />
      <h2 className='font-semibold text-gray-800'>Verwijderen</h2>
      {state.message && (
        <p role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-sm text-red-600'>{state.message}</p>
      )}
      {confirming
        ? (
          <>
            <p ref={confirmation} tabIndex={-1} className='text-gray-700 focus:outline-none'>Weet je het zeker? Dit verwijdert &ldquo;{title}&rdquo; van de site.</p>
            <div className='flex flex-wrap gap-3'>
              <button type='submit' className={dangerButton} disabled={pending}>
                <Trash2 className='w-4 h-4' aria-hidden='true' />
                {pending ? 'Bezig met verwijderen…' : 'Ja, verwijderen'}
              </button>
              <button
                type='button'
                className={secondaryButton}
                onClick={() => {
                  setConfirming(false);
                }}
              >
                Annuleren
              </button>
            </div>
          </>
        )
        : (
          <button
            type='button'
            className={dangerOutlineButton}
            onClick={() => {
              setConfirming(true);
            }}
          >
            <Trash2 className='w-4 h-4' aria-hidden='true' />
            Verwijderen
          </button>
        )}
    </form>
  );
}
