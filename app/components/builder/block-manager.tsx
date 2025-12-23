'use client';

import {
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {
  Trash2,
  Plus,
  GripVertical,
  X,
  Layers,
  Settings,
} from 'lucide-react';
import {ComponentPicker, type ComponentDefinition} from './component-picker';
import {BlockEditor} from './block-editor';

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

type SortableBlockItemProps = {
  block: BuilderBlock;
  onDelete: () => void;
  onEdit: () => void;
};

function SortableBlockItem({block, onDelete, onEdit}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: block.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBlockDisplayName = (b: BuilderBlock): string => {
    if (b.component?.name) {
      return b.component.name;
    }

    if (b['@type'] === '@builder.io/sdk:Element') {
      return 'Element';
    }

    return 'Block';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-gray-50 rounded-lg border group ${
        isDragging ? 'border-primary shadow-lg' : 'border-gray-200'
      }`}
    >
      <button
        type='button'
        className='touch-none cursor-grab active:cursor-grabbing p-1 -m-1'
        {...attributes}
        {...listeners}
      >
        <GripVertical className='w-4 h-4 text-gray-400' />
      </button>

      <span className='flex-1 text-sm font-medium text-gray-700 truncate'>
        {getBlockDisplayName(block)}
      </span>

      <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
        <button
          type='button'
          onClick={onEdit}
          title='Bewerken'
          className='p-1 rounded hover:bg-gray-200 transition-colors'
        >
          <Settings className='w-4 h-4 text-gray-600' />
        </button>
        <button
          type='button'
          onClick={onDelete}
          title='Verwijderen'
          className='p-1 rounded hover:bg-red-100 transition-colors'
        >
          <Trash2 className='w-4 h-4 text-red-500' />
        </button>
      </div>
    </div>
  );
}

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
  const [editingBlock, setEditingBlock] = useState<BuilderBlock | null>(null);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number>(-1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Sync with parent blocks
  useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const {active, over} = event;

    if (over && active.id !== over.id) {
      const oldIndex = localBlocks.findIndex(b => b.id === active.id);
      const newIndex = localBlocks.findIndex(b => b.id === over.id);

      const newBlocks = arrayMove(localBlocks, oldIndex, newIndex);
      setLocalBlocks(newBlocks);
      onBlocksChange(newBlocks);
    }
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

  const handleEditBlock = useCallback((block: BuilderBlock, index: number) => {
    setEditingBlock(block);
    setEditingBlockIndex(index);
  }, []);

  const handleSaveBlock = useCallback((updatedBlock: BuilderBlock) => {
    const newBlocks = [...localBlocks];
    newBlocks[editingBlockIndex] = updatedBlock;
    setLocalBlocks(newBlocks);
    onBlocksChange(newBlocks);
    setEditingBlock(null);
    setEditingBlockIndex(-1);
  }, [localBlocks, editingBlockIndex, onBlocksChange]);

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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
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

                <SortableContext
                  items={localBlocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localBlocks.map((block, index) => (
                    <div key={block.id}>
                      <SortableBlockItem
                        block={block}
                        onDelete={() => {
                          handleDelete(index);
                        }}
                        onEdit={() => {
                          handleEditBlock(block, index);
                        }}
                      />

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
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>

        {/* Footer with info */}
        <div className='px-4 py-3 border-t border-gray-200 bg-gray-50'>
          <p className='text-xs text-gray-500'>
            Sleep blokken om te herschikken. Wijzigingen worden opgeslagen wanneer je op
            &quot;Opslaan&quot; klikt.
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

      {/* Block editor */}
      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          onSave={handleSaveBlock}
          onClose={() => {
            setEditingBlock(null);
            setEditingBlockIndex(-1);
          }}
        />
      )}
    </>
  );
}
