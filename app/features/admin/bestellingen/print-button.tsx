'use client';

import {Printer} from 'lucide-react';
import {secondaryButton} from '../content-editor/styles';

export function PrintButton() {
  return (
    <button
      type='button'
      className={`${secondaryButton} print:hidden`}
      onClick={() => {
        globalThis.print();
      }}
    >
      <Printer className='w-4 h-4' aria-hidden='true' />
      Afdrukken
    </button>
  );
}
