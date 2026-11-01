import {NextResponse} from 'next/server';
import {getSession, type Session} from './session';

type Guard = {session: Session; response?: undefined} | {session?: undefined; response: NextResponse};

/** For admin API routes any logged-in user may use: 401 without a session. */
export async function guardEditorApi(): Promise<Guard> {
  const session = await getSession();

  if (!session) {
    return {response: NextResponse.json({error: 'Unauthorized'}, {status: 401})};
  }

  return {session};
}

/** For admin-only API routes: 401 without a session, 403 for a redacteur. */
export async function guardAdminApi(): Promise<Guard> {
  const guard = await guardEditorApi();

  if (guard.session && guard.session.user.role !== 'admin') {
    return {response: NextResponse.json({error: 'Forbidden'}, {status: 403})};
  }

  return guard;
}
