// @vitest-environment node
import {NextRequest} from 'next/server';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

const getSession = vi.fn();
const dbAccess = vi.fn();

vi.mock('@lib/auth/session', () => ({getSession}));
// Any touch of the database fails the test.
vi.mock('@lib/db', async () => {
  const schema = await import('../../app/lib/db/schema');
  return {
    ...schema,
    db: new Proxy({}, {
      get(_target, property) {
        dbAccess(property);
        throw new Error('database must not be queried');
      },
    }),
  };
});

type Handler = (request: NextRequest, context: {params: Promise<{id: string}>}) => Promise<Response>;
type Loader = () => Promise<Record<string, unknown>>;

// One entry per exported handler in app/api/admin/**/route.ts.
const routes: Array<[string, string, Loader]> = [
  ['audit-logs', 'GET', async () => import('../../app/api/admin/audit-logs/route')],
  ['feedback', 'PATCH', async () => import('../../app/api/admin/feedback/route')],
  ['feedback', 'DELETE', async () => import('../../app/api/admin/feedback/route')],
  ['session', 'GET', async () => import('../../app/api/admin/session/route')],
  ['submissions', 'PATCH', async () => import('../../app/api/admin/submissions/route')],
  ['users', 'GET', async () => import('../../app/api/admin/users/route')],
  ['users', 'POST', async () => import('../../app/api/admin/users/route')],
  ['users/[id]', 'GET', async () => import('../../app/api/admin/users/[id]/route')],
  ['users/[id]', 'PUT', async () => import('../../app/api/admin/users/[id]/route')],
  ['users/[id]', 'DELETE', async () => import('../../app/api/admin/users/[id]/route')],
];

beforeEach(() => {
  getSession.mockReset().mockResolvedValue(undefined);
  dbAccess.mockReset();
});

describe('admin API routes without a session', () => {
  it.each(routes)('%s %s answers 401 and never queries the database', async (_name, method, load) => {
    const handler = (await load())[method] as Handler;
    const request = new NextRequest('http://localhost:3000/api/admin/x', {
      method,
      body: method === 'GET' ? undefined : JSON.stringify({}),
    });

    const response = await handler(request, {params: Promise.resolve({id: 'x'})});

    expect(response.status).toBe(401);
    expect(getSession).toHaveBeenCalled();
    expect(dbAccess).not.toHaveBeenCalled();
  });
});
