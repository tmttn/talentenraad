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

type Upload = (file: File) => Promise<{id: string} | {error: string}>;

/** Sends the raw mp4 to the editor-only upload route; the form then only carries the returned id. */
const uploadVideo: Upload = async file => {
  try {
    const response = await fetch('/api/admin/content/video', {method: 'POST', body: file, headers: {'Content-Type': 'video/mp4'}});
    const body = await response.json().catch(() => ({})) as {id?: string; error?: string};
    if (response.ok && body.id) {
      return {id: body.id};
    }

    return {error: body.error ?? 'Het filmpje kon niet geüpload worden. Probeer het opnieuw.'};
  } catch {
    return {error: 'Het filmpje kon niet geüpload worden. Controleer je verbinding en probeer opnieuw.'};
  }
};

export function VideoField({
  name, currentUrl, error, lostVideo, onPickedChange, upload = uploadVideo,
}: Readonly<Properties & {upload?: Upload}>) {
  const [picked, setPicked] = useState<string>();
  const [uploadId, setUploadId] = useState('');
  const [busy, setBusy] = useState(false);
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
        {/* No name: the file never goes through the server action, only the upload id below */}
        <input
          ref={input}
          id={name}
          type='file'
          accept='video/mp4'
          aria-invalid={shownError ? true : undefined}
          disabled={remove || busy}
          className='block w-full text-sm text-gray-700 file:mr-3 file:rounded-button file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          onChange={async event => {
            const target = event.target;
            const file = target.files?.[0];
            setSizeError(undefined);
            setUploadId('');
            setPicked(undefined);
            onPickedChange?.(false);
            if (!file) {
              return;
            }

            if (file.size > maxBytes) {
              target.value = '';
              setSizeError('Het filmpje is groter dan 25 MB. Kort het in of verklein het op je telefoon.');
              return;
            }

            setBusy(true);
            const result = await upload(file);
            setBusy(false);
            if ('error' in result) {
              target.value = '';
              setSizeError(result.error);
              return;
            }

            setUploadId(result.id);
            setPicked(URL.createObjectURL(file));
            onPickedChange?.(true);
          }}
        />
      </FormField>
      <input type='hidden' name='videoUpload' value={uploadId} />
      {busy && <p role='status' className='text-sm text-gray-600'>Filmpje uploaden…</p>}
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
