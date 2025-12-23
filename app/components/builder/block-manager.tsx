'use client';

import {
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  GripVertical,
  X,
  Layers,
} from 'lucide-react';
import {ComponentPicker, type ComponentDefinition} from './component-picker';

// Builder.io block type
type BuilderBlock = {
  '@type': '@builder.io/sdk:Element';
  id: string;
  component?: {
    name: string;
    options?: Record<string, unknown>;
  };
  children?: BuilderBlock[];
  responsiveStyles?: Record<string, unknown>;
  [key: string]: unknown;
};

type BlockManagerProps = {
  blocks: BuilderBlock[];
  onBlocksChange: (blocks: BuilderBlock[]) => void;
  isOpen: boolean;
  onClose: () => void;
};

const addBlockButtonClasses = [
  'w-full py-2 border-2 border-dashed border-gray-300 rounded',
  'text-gray-400 hover:border-primary hover:text-primary',
  'transition-colors text-sm flex items-center justify-center gap-1',
].join(' ');

export function BlockManager({
  blocks,
  onBlocksChange,
  isOpen,
  onClose,
}: BlockManagerProps) {
  const [localBlocks, setLocalBlocks] = useState<BuilderBlock[]>(blocks);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number>(0);

  // Sync with parent blocks
  useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) {
      return;
    }

    const newBlocks = [...localBlocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    setLocalBlocks(newBlocks);
    onBlocksChange(newBlocks);
  }, [localBlocks, onBlocksChange]);

  const handleMoveDown = useCallback((index: number) => {
    if (index >= localBlocks.length - 1) {
      return;
    }

    const newBlocks = [...localBlocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    setLocalBlocks(newBlocks);
    onBlocksChange(newBlocks);
  }, [localBlocks, onBlocksChange]);

  const handleDelete = useCallback((index: number) => {
    const newBlocks = [...localBlocks];
    newBlocks.splice(index, 1);
    setLocalBlocks(newBlocks);
    onBlocksChange(newBlocks);
  }, [localBlocks, onBlocksChange]);

  const handleAddBlock = useCallback((index: number) => {
    setInsertIndex(index);
    setIsPickerOpen(true);
  }, []);

  const handleSelectComponent = useCallback((component: ComponentDefinition) => {
    const newBlock: BuilderBlock = {
      '@type': '@builder.io/sdk:Element',
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      component: {
        name: component.name,
        options: component.defaultProps,
      },
    };

    const newBlocks = [...localBlocks];
    newBlocks.splice(insertIndex, 0, newBlock);
    setLocalBlocks(newBlocks);
    onBlocksChange(newBlocks);
    setIsPickerOpen(false);
  }, [insertIndex, localBlocks, onBlocksChange]);

  const getBlockDisplayName = (block: BuilderBlock): string => {
    if (block.component?.name) {
      return block.component.name;
    }

    if (block['@type'] === '@builder.io/sdk:Element') {
      return 'Element';
    }

    return 'Block';
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/30 z-40'
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <div className='fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-200'>
          <div className='flex items-center gap-2'>
            <Layers className='w-5 h-5 text-primary' />
            <h2 className='font-semibold text-gray-800'>Pagina blokken</h2>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='p-1 rounded hover:bg-gray-100 transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Block list */}
        <div className='flex-1 overflow-y-auto p-4'>
          {localBlocks.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <p className='mb-4'>Geen blokken op deze pagina</p>
              <button
                type='button'
                onClick={() => {
                  handleAddBlock(0);
                }}
                className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-button hover:bg-primary-hover transition-colors'
              >
                <Plus className='w-4 h-4' />
                Eerste blok toevoegen
              </button>
            </div>
          ) : (
            <div className='space-y-2'>
              {/* Add button at top */}
              <button
                type='button'
                onClick={() => {
                  handleAddBlock(0);
                }}
                className={addBlockButtonClasses}
              >
                <Plus className='w-3 h-3' />
                Toevoegen
              </button>

              {localBlocks.map((block, index) => (
                <div key={block.id}>
                  {/* Block item */}
                  <div className='flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 group'>
                    <GripVertical className='w-4 h-4 text-gray-400 cursor-move' />

                    <span className='flex-1 text-sm font-medium text-gray-700 truncate'>
                      {getBlockDisplayName(block)}
                    </span>

                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        type='button'
                        onClick={() => {
                          handleMoveUp(index);
                        }}
                        disabled={index === 0}
                        title='Omhoog'
                        className='p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      >
                        <ChevronUp className='w-4 h-4 text-gray-600' />
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          handleMoveDown(index);
                        }}
                        disabled={index === localBlocks.length - 1}
                        title='Omlaag'
                        className='p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                      >
                        <ChevronDown className='w-4 h-4 text-gray-600' />
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          handleDelete(index);
                        }}
                        title='Verwijderen'
                        className='p-1 rounded hover:bg-red-100 transition-colors'
                      >
                        <Trash2 className='w-4 h-4 text-red-500' />
                      </button>
                    </div>
                  </div>

                  {/* Add button after each block */}
                  <button
                    type='button'
                    onClick={() => {
                      handleAddBlock(index + 1);
                    }}
                    className={`mt-2 ${addBlockButtonClasses}`}
                  >
                    <Plus className='w-3 h-3' />
                    Toevoegen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with info */}
        <div className='px-4 py-3 border-t border-gray-200 bg-gray-50'>
          <p className='text-xs text-gray-500'>
            Wijzigingen worden opgeslagen wanneer je op &quot;Opslaan&quot; klikt in de toolbar.
          </p>
        </div>
      </div>

      {/* Component picker */}
      <ComponentPicker
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
        }}
        onSelect={handleSelectComponent}
      />
    </>
  );
}
