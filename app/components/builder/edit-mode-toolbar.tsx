'use client';

import {Save, X, Loader2} from 'lucide-react';
import {toast} from 'sonner';
import {useEditMode} from './edit-mode-context';

/**
 * EditModeToolbar - Fixed toolbar shown when in edit mode
 *
 * Displays pending changes count and save/discard buttons.
 * Only visible when in edit mode with pending changes.
 */
export function EditModeToolbar() {
  const {
    isEditMode,
    pendingChanges,
    isSaving,
    saveAllChanges,
    discardAllChanges,
    hasUnsavedChanges,
  } = useEditMode();

  if (!isEditMode) {
    return null;
  }

  const handleSave = async () => {
    const success = await saveAllChanges();
    if (success) {
      toast.success('Wijzigingen opgeslagen');
    } else {
      toast.error('Fout bij opslaan van wijzigingen');
    }
  };

  const handleDiscard = () => {
    if (!hasUnsavedChanges) {
      return;
    }

    // Confirm before discarding
    if (window.confirm('Weet je zeker dat je alle wijzigingen wilt annuleren?')) {
      discardAllChanges();
      toast.info('Wijzigingen geannuleerd');
    }
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white shadow-lg'>
      <div className='container mx-auto px-4 py-2 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='font-medium'>Bewerkmodus actief</span>
          {hasUnsavedChanges && (
            <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
              {pendingChanges.size} {pendingChanges.size === 1 ? 'wijziging' : 'wijzigingen'}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handleDiscard}
            disabled={isSaving || !hasUnsavedChanges}
            className='flex items-center gap-2 px-3 py-1.5 rounded-button bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <X className='w-4 h-4' />
            <span className='hidden sm:inline'>Annuleren</span>
          </button>

          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className='flex items-center gap-2 px-3 py-1.5 rounded-button bg-white text-amber-600 hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'
          >
            {isSaving ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Save className='w-4 h-4' />
            )}
            <span className='hidden sm:inline'>{isSaving ? 'Opslaan...' : 'Opslaan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
