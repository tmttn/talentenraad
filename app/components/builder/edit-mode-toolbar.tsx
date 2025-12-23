'use client';

import {useState} from 'react';
import {
  Save,
  X,
  Loader2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {toast} from 'sonner';
import {useEditMode} from './edit-mode-context';

/**
 * EditModeToolbar - Fixed toolbar shown when in edit mode
 *
 * Displays pending changes count, save/discard buttons, and helpful tips.
 * Only visible when in edit mode.
 */
export function EditModeToolbar() {
  const [showTips, setShowTips] = useState(true);
  const {
    isEditMode,
    pendingChanges,
    isSaving,
    saveAllChanges,
    discardAllChanges,
    hasUnsavedChanges,
    exitEditMode,
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
      // No changes, just exit edit mode
      exitEditMode();
      return;
    }

    // Confirm before discarding
    if (window.confirm('Weet je zeker dat je alle wijzigingen wilt annuleren?')) {
      discardAllChanges();
      toast.info('Wijzigingen geannuleerd');
    }
  };

  return (
    <div className='fixed top-0 left-0 right-0 z-[9999] shadow-lg'>
      {/* Main toolbar */}
      <div className='bg-amber-500 text-white'>
        <div className='container mx-auto px-4 py-2 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='font-medium'>Bewerkmodus</span>
            {hasUnsavedChanges ? (
              <span className='bg-white/20 px-2 py-0.5 rounded text-sm'>
                {pendingChanges.size} {pendingChanges.size === 1 ? 'wijziging' : 'wijzigingen'}
              </span>
            ) : (
              <span className='bg-white/10 px-2 py-0.5 rounded text-sm text-white/80'>
                Geen wijzigingen
              </span>
            )}
            <button
              type='button'
              onClick={() => {
                setShowTips(prev => !prev);
              }}
              className='flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 transition-colors text-sm'
              title={showTips ? 'Verberg tips' : 'Toon tips'}
            >
              <HelpCircle className='w-4 h-4' />
              <span className='hidden sm:inline'>Tips</span>
              {showTips ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
            </button>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handleDiscard}
              disabled={isSaving}
              className='flex items-center gap-2 px-3 py-1.5 rounded-button bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <X className='w-4 h-4' />
              <span className='hidden sm:inline'>{hasUnsavedChanges ? 'Annuleren' : 'Sluiten'}</span>
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

      {/* Tips panel */}
      {showTips && (
        <div className='bg-amber-50 border-b border-amber-200 text-amber-800'>
          <div className='container mx-auto px-4 py-3'>
            <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold'>1</span>
                <span>Klik op tekst om direct te bewerken</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold'>2</span>
                <span>Gebruik de <strong>&quot;Blokken&quot;</strong> knop rechtsonder om secties toe te voegen of te verwijderen</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold'>3</span>
                <span>Klik op <strong>&quot;Opslaan&quot;</strong> om je wijzigingen te bewaren</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
