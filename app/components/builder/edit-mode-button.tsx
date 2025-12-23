'use client';

import {Pencil} from 'lucide-react';
import {useEditModeOptional} from './edit-mode-context';

/**
 * EditModeButton - Toggle button for inline editing mode
 *
 * When clicked, enables inline editing on the page.
 * Only visible when EditModeProvider indicates user is admin and not already in edit mode.
 * Exit is handled by the EditModeToolbar.
 */
export function EditModeButton() {
  const editMode = useEditModeOptional();

  // Don't show if not in an EditModeProvider or not admin
  if (!editMode?.isAdmin) {
    return null;
  }

  const {isEditMode, enterEditMode} = editMode;

  // Don't show button when already in edit mode (toolbar handles exit)
  if (isEditMode) {
    return null;
  }

  return (
    <button
      type='button'
      onClick={enterEditMode}
      className='fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-button shadow-lg transition-all bg-primary hover:bg-primary-hover hover:scale-105 text-white group'
      title='Start met bewerken van deze pagina'
    >
      <Pencil className='w-5 h-5' />
      <div className='flex flex-col items-start'>
        <span className='font-medium'>Pagina bewerken</span>
        <span className='text-xs text-white/70 group-hover:text-white/90'>
          Klik om tekst en secties aan te passen
        </span>
      </div>
    </button>
  );
}
