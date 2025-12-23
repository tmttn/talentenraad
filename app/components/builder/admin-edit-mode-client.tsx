'use client';

import {type ReactNode} from 'react';
import {EditModeProvider} from './edit-mode-context';
import {EditModeToolbar} from './edit-mode-toolbar';

type AdminEditModeClientProps = {
  children: ReactNode;
  isAdmin: boolean;
};

/**
 * AdminEditModeClient - Client wrapper for edit mode
 *
 * Provides EditModeProvider context and renders the toolbar when in edit mode.
 */
export function AdminEditModeClient({children, isAdmin}: AdminEditModeClientProps) {
  return (
    <EditModeProvider isAdmin={isAdmin}>
      <EditModeToolbar />
      {children}
    </EditModeProvider>
  );
}
