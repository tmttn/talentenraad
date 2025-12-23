'use client';

import {useState, useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {Pencil, ExternalLink} from 'lucide-react';

/**
 * EditModeButton - Shows an edit button for admins
 *
 * Opens Builder.io's visual editor with the current page loaded.
 * Only visible to authenticated admins.
 */
export function EditModeButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
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

  // Don't show while checking or if not admin
  if (isChecking || !isAdmin) {
    return null;
  }

  const openEditor = () => {
    // Determine the model based on the current path
    let model = 'page';
    if (pathname.startsWith('/nieuws/')) {
      model = 'nieuws';
    } else if (pathname.startsWith('/activiteiten/')) {
      model = 'activiteit';
    }

    // Build the Builder.io editor URL
    // This opens the visual editor with the current page pre-loaded
    const siteUrl = window.location.origin + pathname;
    const builderUrl = `https://builder.io/content?model=${model}&url=${encodeURIComponent(siteUrl)}`;

    window.open(builderUrl, '_blank');
  };

  return (
    <button
      type='button'
      onClick={openEditor}
      className='fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-button shadow-lg transition-colors bg-primary hover:bg-primary-hover text-white'
      title='Bewerk pagina in Builder.io'
    >
      <Pencil className='w-4 h-4' />
      <span className='hidden sm:inline'>Bewerken</span>
      <ExternalLink className='w-3 h-3 opacity-70' />
    </button>
  );
}
