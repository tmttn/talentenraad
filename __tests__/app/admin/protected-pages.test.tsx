import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

const getSession = vi.fn();
const dbAccess = vi.fn();
const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`);
});

vi.mock('@lib/auth/session', () => ({getSession}));
vi.mock('next/navigation', () => ({
  redirect,
  notFound: vi.fn(),
  usePathname: () => '/admin',
  useRouter: () => ({push: vi.fn(), refresh: vi.fn(), replace: vi.fn()}),
  useSearchParams: () => new URLSearchParams(),
}));
// Any touch of the database fails the test.
vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
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

type Page = (properties: {params: Promise<{id: string}>}) => unknown;

const pages: Array<[string, () => Promise<{default: Page}>]> = [
  ['dashboard', async () => import('../../../app/(admin)/admin/(protected)/page') as Promise<{default: Page}>],
  ['audit-logs', async () => import('../../../app/(admin)/admin/(protected)/audit-logs/page') as Promise<{default: Page}>],
  ['gebruikers', async () => import('../../../app/(admin)/admin/(protected)/gebruikers/page') as Promise<{default: Page}>],
  ['content', async () => import('../../../app/(admin)/admin/(protected)/content/page') as Promise<{default: Page}>],
  ['content list', async () => import('../../../app/(admin)/admin/(protected)/content/[type]/page') as Promise<{default: Page}>],
  ['content new', async () => import('../../../app/(admin)/admin/(protected)/content/[type]/nieuw/page') as Promise<{default: Page}>],
  ['content edit', async () => import('../../../app/(admin)/admin/(protected)/content/[type]/[slug]/page') as Promise<{default: Page}>],
  ['announcement', async () => import('../../../app/(admin)/admin/(protected)/content/aankondiging/page') as Promise<{default: Page}>],
  ['submissions', async () => import('../../../app/(admin)/admin/(protected)/submissions/page') as Promise<{default: Page}>],
  ['submission detail', async () => import('../../../app/(admin)/admin/(protected)/submissions/[id]/page') as Promise<{default: Page}>],
];

beforeEach(() => {
  getSession.mockReset().mockResolvedValue(undefined);
  dbAccess.mockReset();
  redirect.mockClear();
});

describe('protected admin pages', () => {
  it.each(pages)('%s redirects without an admin session and never queries the database', async (_name, load) => {
    const {default: Page} = await load();

    await expect(Promise.resolve(Page({params: Promise.resolve({id: 'x'})}))).rejects.toThrow('NEXT_REDIRECT /admin/login');
    expect(getSession).toHaveBeenCalled();
    expect(dbAccess).not.toHaveBeenCalled();
  });
});
