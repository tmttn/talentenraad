'use client';

import {useState, useEffect, useCallback} from 'react';
import {usePathname} from 'next/navigation';
import {Pencil, X} from 'lucide-react';
import {createPortal} from 'react-dom';

/**
 * EditModeButton - Shows an edit button for admins
 *
 * Opens Builder.io's visual editor in a full-screen overlay.
 * Only visible to authenticated admins.
 */
export function EditModeButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const pathname = usePathname();

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      try {
        const response = await fetch('/api/admin/session', {
          method: 'GET',
          credentials: 'include',
        });
        setIsAdmin(response.ok);
      } catch {
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    }

    void checkAdmin();
  }, []);

  // Handle escape key to close editor
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsEditorOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isEditorOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isEditorOpen, handleEscape]);

  // Don't show while checking or if not admin
  if (isChecking || !isAdmin) {
    return null;
  }

  // Determine the model based on the current path
  let model = 'page';
  if (pathname.startsWith('/nieuws/')) {
    model = 'nieuws';
  } else if (pathname.startsWith('/activiteiten/')) {
    model = 'activiteit';
  }

  // Build the Builder.io editor URL
  const siteUrl = window.location.origin + pathname;
  const builderUrl = `https://builder.io/content?model=${model}&url=${encodeURIComponent(siteUrl)}`;

  return (
    <>
      <button
        type='button'
        onClick={() => setIsEditorOpen(true)}
        className='fixed bottom-40 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-button shadow-lg transition-colors bg-primary hover:bg-primary-hover text-white'
        title='Bewerk pagina'
      >
        <Pencil className='w-4 h-4' />
        <span className='hidden sm:inline'>Bewerken</span>
      </button>

      {isEditorOpen && typeof window !== 'undefined' && createPortal(
        <div className='fixed inset-0 z-[9999] bg-black/90 flex flex-col'>
          {/* Header bar */}
          <div className='flex items-center justify-between px-4 py-2 bg-gray-900 text-white'>
            <span className='text-sm font-medium'>Builder.io Editor - {pathname}</span>
            <button
              type='button'
              onClick={() => setIsEditorOpen(false)}
              className='flex items-center gap-2 px-3 py-1.5 rounded-button bg-gray-700 hover:bg-gray-600 transition-colors'
            >
              <X className='w-4 h-4' />
              <span>Sluiten (Esc)</span>
            </button>
          </div>

          {/* Editor iframe */}
          <iframe
            src={builderUrl}
            className='flex-1 w-full border-0'
            title='Builder.io Editor'
            allow='clipboard-write'
          />
        </div>,
        document.body,
      )}
    </>
  );
}
