'use client';

import {Pencil, X} from 'lucide-react';
import {useEditModeOptional} from './edit-mode-context';

/**
 * EditModeButton - Toggle button for inline editing mode
 *
 * When clicked, enables inline editing on the page.
 * Only visible when EditModeProvider indicates user is admin.
 */
export function EditModeButton() {
  const editMode = useEditModeOptional();

  // Don't show if not in an EditModeProvider or not admin
  if (!editMode?.isAdmin) {
    return null;
  }

  const {isEditMode, enterEditMode, exitEditMode, hasUnsavedChanges} = editMode;

  // If in edit mode, show a smaller exit button (main controls are in toolbar)
  if (isEditMode) {
    const exitButtonClasses = [
      'fixed bottom-40 right-6 z-50 flex items-center gap-2 px-4 py-2',
      'rounded-button shadow-lg transition-colors bg-gray-600 hover:bg-gray-700',
      'text-white disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');

    return (
      <button
        type='button'
        onClick={exitEditMode}
        disabled={hasUnsavedChanges}
        className={exitButtonClasses}
        title={hasUnsavedChanges ? 'Sla eerst wijzigingen op' : 'Stop bewerken'}
      >
        <X className='w-4 h-4' />
        <span className='hidden sm:inline'>Stop bewerken</span>
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={enterEditMode}
      className='fixed bottom-40 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-button shadow-lg transition-colors bg-primary hover:bg-primary-hover text-white'
      title='Bewerk pagina'
    >
      <Pencil className='w-4 h-4' />
      <span className='hidden sm:inline'>Bewerken</span>
    </button>
  );
}
