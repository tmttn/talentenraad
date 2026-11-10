import {useEffect, useState, type MouseEvent as ReactMouseEvent} from 'react';

export const unsavedMessage = 'Je wijzigingen zijn nog niet opgeslagen. Wil je de pagina toch verlaten?';

/** True for a plain left click that would follow a link in this tab. */
export function leavesPage(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
  if (!anchor || anchor.getAttribute('target') === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }

  return !(anchor.getAttribute('href') ?? '').startsWith('#');
}

/**
 * Asks before leaving an editor form with changes: a link in the admin (the back button, the menu,
 * Annuleren) gets a confirm, closing or reloading the tab the browser's own warning.
 * Saving redirects through the router, which is no link click, so it never asks.
 * Spread the returned handlers on the <form>; they mark it changed on the first edit.
 */
export function useUnsavedWarning() {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    // Capture phase on document: runs before React (and next/link) sees the click
    const onClick = (event: MouseEvent) => {
      if (leavesPage(event) && !globalThis.confirm(unsavedMessage)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    globalThis.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      globalThis.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty]);

  return {
    dirty,
    formHandlers: {
      onChange() {
        setDirty(true);
      },
      // Switches are buttons and send no change event
      onClick(event: ReactMouseEvent<HTMLFormElement>) {
        if (event.target instanceof Element && event.target.closest('[role="switch"]')) {
          setDirty(true);
        }
      },
    },
  };
}
