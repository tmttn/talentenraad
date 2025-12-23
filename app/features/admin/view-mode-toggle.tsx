'use client';

import {LayoutList, LayoutGrid} from 'lucide-react';

export type ViewMode = 'table' | 'cards';

type ViewModeToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({mode, onChange}: ViewModeToggleProps) {
  return (
    <div className='flex rounded-button border border-gray-200 overflow-hidden'>
      <button
        type='button'
        onClick={() => {
          onChange('table');
        }}
        title='Tabelweergave'
        className={`p-2 transition-colors ${
          mode === 'table'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutList className='w-4 h-4' />
      </button>
      <button
        type='button'
        onClick={() => {
          onChange('cards');
        }}
        title='Kaartweergave'
        className={`p-2 transition-colors border-l border-gray-200 ${
          mode === 'cards'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid className='w-4 h-4' />
      </button>
    </div>
  );
}
