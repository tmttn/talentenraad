'use client';

import {useEffect, useRef, useState} from 'react';
import {FormField} from '@components/ui';

const maxBytes = 10 * 1024 * 1024;
const maxSide = 1600;

export type GalleryPhoto = {file: string; url: string};

type Properties = {
  name: string;
  max: number;
  /** Photos already on the item, in order. */
  current: GalleryPhoto[];
  error?: string;
  /** The previous submit had new photos that the browser has forgotten since. */
  lostPhotos?: boolean;
  onPickedChange?: (picked: boolean) => void;
};

type Picked = {file: File; url: string};

/**
 * Shrinks a phone photo to at most 1600px before it is sent, so a dozen photos stay under the
 * upload limit. The server re-encodes it anyway; when the browser cannot decode it, the original goes.
 */
async function shrink(file: File): Promise<File> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85);
    });
    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', {type: 'image/jpeg'});
  } catch {
    return file;
  }
}

export function GalleryField({
  name, max, current, error, lostPhotos, onPickedChange,
}: Readonly<Properties>) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    for (const item of picked) {
      URL.revokeObjectURL(item.url);
    }
  }, [picked]);

  const kept = current.filter(photo => !removed.includes(photo.file));
  const room = max - kept.length;
  const shownError = localError ?? error;

  const toggle = (file: string) => {
    setRemoved(previous => (previous.includes(file) ? previous.filter(item => item !== file) : [...previous, file]));
  };

  const pick = async (files: File[]) => {
    setLocalError(undefined);
    if (files.some(file => file.size > maxBytes)) {
      setLocalError('Een van de foto\'s is groter dan 10 MB.');
    }

    const usable = files.filter(file => file.size <= maxBytes);
    if (usable.length > room) {
      setLocalError(`Er kunnen nog ${room} foto's bij (hoogstens ${max}).`);
    }

    setBusy(true);
    const small = await Promise.all(usable.slice(0, Math.max(room, 0)).map(shrink));
    setBusy(false);
    if (input.current && typeof DataTransfer === 'function') {
      const transfer = new DataTransfer();
      for (const file of small) {
        transfer.items.add(file);
      }

      input.current.files = transfer.files;
    }

    setPicked(small.map(file => ({file, url: URL.createObjectURL(file)})));
    onPickedChange?.(small.length > 0);
  };

  return (
    <div className='space-y-3'>
      <FormField
        label={`Foto's`}
        htmlFor={`${name}Nieuw`}
        error={shownError}
        hint={lostPhotos
          ? 'Kies de nieuwe foto\'s opnieuw.'
          : `Extra foto's onder de tekst, hoogstens ${max}. Kies er meerdere tegelijk; we verkleinen ze automatisch. Geen herkenbare kinderen zonder toestemming.`}
      >
        <input
          ref={input}
          id={`${name}Nieuw`}
          name={`${name}Nieuw`}
          type='file'
          multiple
          accept='image/jpeg,image/png,image/webp'
          aria-invalid={shownError ? true : undefined}
          disabled={room <= 0 || busy}
          className='block w-full text-sm text-gray-700 file:mr-3 file:rounded-button file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          onChange={event => {
            void pick([...(event.target.files ?? [])]);
          }}
        />
      </FormField>
      <input type='hidden' name={`${name}Behouden`} value={kept.map(photo => photo.file).join('\n')} />
      {busy && <p className='text-sm text-gray-600' role='status'>Foto&apos;s verkleinen…</p>}

      {(current.length > 0 || picked.length > 0) && (
        <ul className='grid grid-cols-2 sm:grid-cols-4 gap-3' aria-label={`Foto's`}>
          {current.map((photo, index) => {
            const isRemoved = removed.includes(photo.file);
            return (
              <li key={photo.file} className='space-y-1.5'>
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview from the content branch */}
                <img
                  src={photo.url}
                  alt={`Foto ${index + 1}`}
                  className={`aspect-square w-full rounded-card border border-gray-200 object-cover ${isRemoved ? 'opacity-40' : ''}`}
                />
                <label className='flex items-center gap-2 text-sm text-gray-700'>
                  <input
                    type='checkbox'
                    checked={isRemoved}
                    onChange={() => {
                      toggle(photo.file);
                    }}
                  />
                  Verwijderen
                </label>
              </li>
            );
          })}
          {picked.map((item, index) => (
            <li key={item.url} className='space-y-1.5'>
              {/* eslint-disable-next-line @next/next/no-img-element -- blob preview, not optimizable */}
              <img src={item.url} alt={`Nieuwe foto ${index + 1}`} className='aspect-square w-full rounded-card border-2 border-dashed border-primary object-cover' />
              <span className='block text-sm text-gray-600'>Nieuw</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
