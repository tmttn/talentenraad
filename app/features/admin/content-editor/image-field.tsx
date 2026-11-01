'use client';

import {useEffect, useRef, useState} from 'react';
import {FormField, Switch} from '@components/ui';

const maxBytes = 10 * 1024 * 1024;

type Properties = {
  name: string;
  label: string;
  currentUrl?: string;
  error?: string;
  /** The previous submit had a file that the browser has forgotten since. */
  lostPhoto?: boolean;
  remove: boolean;
  onRemoveChange: (remove: boolean) => void;
  onPickedChange?: (picked: boolean) => void;
};

export function ImageField({
  name, label, currentUrl, error, lostPhoto, remove, onRemoveChange, onPickedChange,
}: Readonly<Properties>) {
  const [picked, setPicked] = useState<string>();
  const [sizeError, setSizeError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (picked) {
      URL.revokeObjectURL(picked);
    }
  }, [picked]);

  const shown = picked ?? (remove ? undefined : currentUrl);
  const shownError = sizeError ?? error;

  return (
    <div className='space-y-3'>
      <FormField
        label={label}
        htmlFor={name}
        error={shownError}
        hint={lostPhoto ? 'Kies de foto opnieuw.' : 'Een jpg-, png- of webp-foto tot 10 MB. We verkleinen ze automatisch.'}
      >
        <input
          ref={input}
          id={name}
          name={name}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          aria-invalid={shownError ? true : undefined}
          disabled={remove}
          className='block w-full text-sm text-gray-700 file:mr-3 file:rounded-button file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          onChange={event => {
            const file = event.target.files?.[0];
            setSizeError(undefined);
            if (file && file.size > maxBytes) {
              event.target.value = '';
              setPicked(undefined);
              setSizeError('De foto is groter dan 10 MB.');
              onPickedChange?.(false);
              return;
            }

            setPicked(file ? URL.createObjectURL(file) : undefined);
            onPickedChange?.(Boolean(file));
          }}
        />
      </FormField>
      {shown && (
        // eslint-disable-next-line @next/next/no-img-element -- blob/admin preview, not optimizable
        <img src={shown} alt='Huidige foto' className='max-h-48 rounded-card border border-gray-200' />
      )}
      {currentUrl && (
        <Switch
          label='Foto verwijderen'
          name='verwijderAfbeelding'
          checked={remove}
          disabled={picked !== undefined}
          onChange={event => {
            if (event.target.checked && input.current) {
              input.current.value = '';
              setPicked(undefined);
              onPickedChange?.(false);
            }

            onRemoveChange(event.target.checked);
          }}
        />
      )}
    </div>
  );
}
