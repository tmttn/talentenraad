import {cache} from 'react';
import {redirect} from 'next/navigation';
import {getSession, type Session} from './session';

/** One session lookup per request, shared by the layout and the page. */
const getCachedSession = cache(getSession);

/**
 * Call at the top of every protected admin page (and the layout): any logged-in
 * user (admin or redacteur). Layouts are not re-rendered on client navigation,
 * so the page must check by itself.
 */
export async function requireEditorSession(): Promise<Session> {
  const session = await getCachedSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

/** For admin-only pages: a redacteur is sent back to the dashboard. */
export async function requireAdminSession(): Promise<Session> {
  const session = await requireEditorSession();

  if (session.user.role !== 'admin') {
    redirect('/admin');
  }

  return session;
}
