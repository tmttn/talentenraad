'use client';

import {useEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from 'react';
import Image from 'next/image';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import type {ContentImage} from '@lib/content/files';

type Properties = {
  fotos: ContentImage[];
  /** Used in the alt text: "Foto 2 bij <titel>". */
  titel: string;
};

const roundButton = 'inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black contour-xs shadow-hard-sm transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus disabled:opacity-40 disabled:pointer-events-none';

/**
 * The extra photos of a news item, below the text. A tile opens the photo large in a lightbox on the
 * page (arrows, swipe, Escape). Each tile is still a link to the full photo, so without JavaScript
 * the browser shows the photo itself.
 */
export function FotoGalerij({fotos, titel}: Readonly<Properties>) {
  const [open, setOpen] = useState<number>();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLAnchorElement>(null);
  const swipeStart = useRef<number>(undefined);

  const alt = (index: number) => `Foto ${index + 1} bij ${titel}`;
  const go = (step: number) => {
    setOpen(current => (current === undefined ? current : (current + step + fotos.length) % fotos.length));
  };

  useEffect(() => {
    const element = dialog.current;
    if (!element || open === undefined || element.open) {
      return;
    }

    if (typeof element.showModal === 'function') {
      element.showModal();
    } else {
      element.setAttribute('open', '');
    }

    closeButton.current?.focus();
    document.documentElement.style.overflow = 'hidden';
  }, [open]);

  useEffect(() => () => {
    document.documentElement.style.overflow = '';
  }, []);

  if (fotos.length === 0) {
    return null;
  }

  const close = () => {
    if (dialog.current?.open && typeof dialog.current.close === 'function') {
      dialog.current.close();
    } else {
      dialog.current?.removeAttribute('open');
      setOpen(undefined);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    swipeStart.current = event.clientX;
  };

  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = undefined;
    if (start !== undefined && Math.abs(event.clientX - start) > 50) {
      go(event.clientX < start ? 1 : -1);
    }
  };

  const shown = open === undefined ? undefined : fotos[open];
  const meerdere = fotos.length > 1;

  return (
    <section aria-label={`Foto's`} className='flex flex-col gap-4'>
      <h2 className='font-display font-extrabold text-black text-[clamp(24px,2.2vw,30px)] tracking-[-0.02em]'>Foto&apos;s</h2>
      <ul className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
        {fotos.map((foto, index) => (
          <li key={foto.src}>
            <a
              href={foto.src}
              onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                  return; // A new tab or window stays the browser's choice
                }

                event.preventDefault();
                trigger.current = event.currentTarget;
                setOpen(index);
              }}
              className='block rounded-tile contour-xs overflow-hidden bg-gray-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus'
            >
              <Image
                src={foto.src}
                width={foto.width}
                height={foto.height}
                alt={alt(index)}
                sizes='(min-width: 820px) 250px, 50vw'
                className='aspect-square w-full object-cover'
              />
            </a>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={open === undefined ? 'Foto' : `Foto ${open + 1} van ${fotos.length}`}
        onClose={() => {
          setOpen(undefined);
          document.documentElement.style.overflow = '';
          trigger.current?.focus(); // Back to the tile that opened it, also in Safari
        }}
        onKeyDown={onKeyDown}
        onClick={event => {
          if (event.target === event.currentTarget) {
            close(); // A click on the dark backdrop
          }
        }}
        className='m-0 h-dvh max-h-none w-screen max-w-none bg-black/[0.92] p-0 text-white backdrop:bg-black/60 open:flex open:flex-col'
      >
        {shown && open !== undefined && (
          <>
            <div className='flex items-center justify-between gap-3 p-3 sm:p-4'>
              <p className='text-[15px] font-bold' aria-live='polite'>{open + 1} / {fotos.length}</p>
              <button type='button' onClick={close} aria-label='Sluiten' className={roundButton} ref={closeButton}>
                <X className='h-6 w-6' strokeWidth={2.5} aria-hidden='true' />
              </button>
            </div>
            <div
              className='relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6 sm:px-20 touch-pan-y select-none'
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onClick={event => {
                if (event.target === event.currentTarget) {
                  close();
                }
              }}
            >
              <Image
                key={shown.src}
                src={shown.src}
                width={shown.width}
                height={shown.height}
                alt={alt(open)}
                sizes='100vw'
                draggable={false}
                className='max-h-full w-auto max-w-full rounded-tile object-contain'
              />
              {meerdere && (
                <>
                  <button type='button' onClick={() => go(-1)} aria-label='Vorige foto' className={`${roundButton} absolute left-3 sm:left-5 top-1/2 -translate-y-1/2`}>
                    <ChevronLeft className='h-6 w-6' strokeWidth={2.5} aria-hidden='true' />
                  </button>
                  <button type='button' onClick={() => go(1)} aria-label='Volgende foto' className={`${roundButton} absolute right-3 sm:right-5 top-1/2 -translate-y-1/2`}>
                    <ChevronRight className='h-6 w-6' strokeWidth={2.5} aria-hidden='true' />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
