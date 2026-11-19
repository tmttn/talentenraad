'use client';

import {useEffect, useRef, useState} from 'react';
import {FormField, Switch} from '@components/ui';

const maxBytes = 25 * 1024 * 1024;

type Properties = {
  name: string;
  currentUrl?: string;
  error?: string;
  /** The previous submit had a video that the browser has forgotten since. */
  lostVideo?: boolean;
  onPickedChange?: (picked: boolean) => void;
};

export function VideoField({
  name, currentUrl, error, lostVideo, onPickedChange,
}: Readonly<Properties>) {
  const [picked, setPicked] = useState<string>();
  const [remove, setRemove] = useState(false);
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
        label='Filmpje'
        htmlFor={name}
        error={shownError}
        hint={lostVideo
          ? 'Kies het filmpje opnieuw.'
          : 'Een kort mp4-filmpje tot 25 MB, onder de tekst. Geen herkenbare kinderen. We halen locatie en toestelgegevens eruit.'}
      >
        <input
          ref={input}
          id={name}
          name={name}
          type='file'
          accept='video/mp4'
          aria-invalid={shownError ? true : undefined}
          disabled={remove}
          className='block w-full text-sm text-gray-700 file:mr-3 file:rounded-button file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          onChange={event => {
            const file = event.target.files?.[0];
            setSizeError(undefined);
            if (file && file.size > maxBytes) {
              event.target.value = '';
              setPicked(undefined);
              setSizeError('Het filmpje is groter dan 25 MB. Kort het in of verklein het op je telefoon.');
              onPickedChange?.(false);
              return;
            }

            setPicked(file ? URL.createObjectURL(file) : undefined);
            onPickedChange?.(Boolean(file));
          }}
        />
      </FormField>
      {shown && (
        <video src={shown} controls preload='metadata' aria-label='Huidig filmpje' className='max-h-64 rounded-card border border-gray-200 bg-black' />
      )}
      {currentUrl && (
        <Switch
          label='Filmpje verwijderen'
          name='verwijderVideo'
          checked={remove}
          disabled={picked !== undefined}
          onChange={event => {
            if (event.target.checked && input.current) {
              input.current.value = '';
              setPicked(undefined);
              onPickedChange?.(false);
            }

            setRemove(event.target.checked);
          }}
        />
      )}
    </div>
  );
}
