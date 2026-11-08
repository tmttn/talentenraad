'use client';

import {useState} from 'react';

type Regel = {id: string; aantal: number; naam: string; keuzes: string};

/** The products of an order, large, each with a box to tick while handing them over (on this phone only). */
export function AfgifteLijst({regels, gedimd = false}: Readonly<{regels: Regel[]; gedimd?: boolean}>) {
  const [aangevinkt, setAangevinkt] = useState<Set<string>>(new Set());

  return (
    <ul className={`flex flex-col gap-2.5 ${gedimd ? 'opacity-60' : ''}`}>
      {regels.map(regel => (
        <li key={regel.id}>
          <label className='flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-card cursor-pointer has-[:checked]:border-green-600 has-[:checked]:bg-green-50'>
            {!gedimd && (
              <input
                type='checkbox'
                checked={aangevinkt.has(regel.id)}
                onChange={() => {
                  setAangevinkt(previous => {
                    const next = new Set(previous);
                    if (next.has(regel.id)) {
                      next.delete(regel.id);
                    } else {
                      next.add(regel.id);
                    }

                    return next;
                  });
                }}
                className='w-7 h-7 shrink-0 accent-primary'
              />
            )}
            <span className='text-[40px] font-extrabold leading-none min-w-[2.75rem]'>{regel.aantal}×</span>
            <span className='flex flex-col'>
              <span className='text-[22px] font-bold leading-tight'>{regel.naam}</span>
              {regel.keuzes && <span className='text-lg font-semibold text-gray-700'>{regel.keuzes}</span>}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
