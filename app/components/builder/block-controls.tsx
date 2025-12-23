'use client';

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  GripVertical,
  Plus,
} from 'lucide-react';

type BlockControlsProps = {
  blockName: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onAddAbove: () => void;
  onAddBelow: () => void;
};

export function BlockControls({
  blockName,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  onAddAbove,
  onAddBelow,
}: BlockControlsProps) {
  return (
    <div className='absolute -left-12 top-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
      {/* Add above button */}
      <button
        type='button'
        onClick={onAddAbove}
        title='Component toevoegen hierboven'
        className='p-1 bg-primary text-white rounded hover:bg-primary-hover transition-colors'
      >
        <Plus className='w-4 h-4' />
      </button>

      {/* Move and delete controls */}
      <div className='flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden'>
        <button
          type='button'
          onClick={onMoveUp}
          disabled={!canMoveUp}
          title='Omhoog verplaatsen'
          className='p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <ChevronUp className='w-4 h-4 text-gray-600' />
        </button>

        <div className='px-1.5 py-1 bg-gray-50 border-y border-gray-200' title={blockName}>
          <GripVertical className='w-4 h-4 text-gray-400 cursor-move' />
        </div>

        <button
          type='button'
          onClick={onMoveDown}
          disabled={!canMoveDown}
          title='Omlaag verplaatsen'
          className='p-1.5 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
        >
          <ChevronDown className='w-4 h-4 text-gray-600' />
        </button>

        <button
          type='button'
          onClick={onDelete}
          title='Verwijderen'
          className='p-1.5 hover:bg-red-50 transition-colors border-t border-gray-200'
        >
          <Trash2 className='w-4 h-4 text-red-500' />
        </button>
      </div>

      {/* Add below button */}
      <button
        type='button'
        onClick={onAddBelow}
        title='Component toevoegen hieronder'
        className='p-1 bg-primary text-white rounded hover:bg-primary-hover transition-colors'
      >
        <Plus className='w-4 h-4' />
      </button>
    </div>
  );
}

type AddBlockButtonProps = {
  onClick: () => void;
};

export function AddBlockButton({onClick}: AddBlockButtonProps) {
  const buttonClasses = [
    'w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500',
    'hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors',
    'flex items-center justify-center gap-2',
  ].join(' ');

  return (
    <button
      type='button'
      onClick={onClick}
      className={buttonClasses}
    >
      <Plus className='w-5 h-5' />
      <span>Component toevoegen</span>
    </button>
  );
}
