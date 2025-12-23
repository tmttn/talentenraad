import {type ReactNode} from 'react';
import {auth0, verifyAdmin} from '@lib/auth0';
import {AdminEditModeClient} from './admin-edit-mode-client';

type AdminEditModeWrapperProps = {
  children: ReactNode;
};

/**
 * AdminEditModeWrapper - Server component that checks admin status
 *
 * Checks if the current user is an admin and wraps children
 * with the EditModeProvider on the client side.
 */
export async function AdminEditModeWrapper({children}: AdminEditModeWrapperProps) {
  let isAdmin = false;

  try {
    const session = await auth0.getSession();
    if (session?.user?.email) {
      isAdmin = await verifyAdmin(session.user.email);
    }
  } catch {
    // Not logged in or error checking - not admin
    isAdmin = false;
  }

  return (
    <AdminEditModeClient isAdmin={isAdmin}>
      {children}
    </AdminEditModeClient>
  );
}
