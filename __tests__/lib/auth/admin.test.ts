// @vitest-environment node
import {type SQL} from 'drizzle-orm';
import {PgDialect} from 'drizzle-orm/pg-core';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const renderWhere = (call: unknown[]) => new PgDialect().sqlToQuery((call[0] as {where: SQL}).where);

const findFirst = vi.fn();
const insertValues = vi.fn();
const updateSet = vi.fn();

vi.mock('@lib/db', async () => ({
  users: (await import('../../../app/lib/db/schema')).users,
  db: {
    query: {users: {findFirst}},
    insert: () => ({
      values: (values: unknown) => {
        insertValues(values);
        return {returning: async () => [{id: 'new-id', email: (values as {email: string}).email}]};
      },
    }),
    update: () => ({
      set: (values: unknown) => {
        updateSet(values);
        return {where: async () => undefined};
      },
    }),
  },
}));

const {
  isAdminEmail, verifyAdmin, normalizeEmail, ensureAdminUser, safeReturnTo,
} = await import('@lib/auth/admin');

beforeEach(() => {
  findFirst.mockReset();
  insertValues.mockReset();
  updateSet.mockReset();
  vi.stubEnv('ADMIN_EMAILS', 'admin@test.com');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  Admin@Test.COM ')).toBe('admin@test.com');
  });
});

describe('isAdminEmail', () => {
  it('returns false for null, undefined and empty email', () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail('')).toBe(false);
  });

  it('matches case-insensitively and ignores surrounding whitespace', () => {
    expect(isAdminEmail('admin@test.com')).toBe(true);
    expect(isAdminEmail(' ADMIN@TEST.COM ')).toBe(true);
  });

  it('handles comma-separated lists with whitespace and empty entries', () => {
    vi.stubEnv('ADMIN_EMAILS', '  admin@test.com  ,,  Other@test.com  ');
    expect(isAdminEmail('admin@test.com')).toBe(true);
    expect(isAdminEmail('other@test.com')).toBe(true);
    expect(isAdminEmail('')).toBe(false);
  });

  it('returns false when not listed or ADMIN_EMAILS is unset', () => {
    expect(isAdminEmail('notadmin@test.com')).toBe(false);
    vi.stubEnv('ADMIN_EMAILS', '');
    expect(isAdminEmail('admin@test.com')).toBe(false);
  });
});

describe('verifyAdmin', () => {
  it('accepts ADMIN_EMAILS without a database lookup', async () => {
    await expect(verifyAdmin('Admin@test.com')).resolves.toBe(true);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it('falls back to users.isAdmin', async () => {
    findFirst.mockResolvedValueOnce({isAdmin: true}).mockResolvedValueOnce({isAdmin: false}).mockResolvedValueOnce(undefined);
    await expect(verifyAdmin('db-admin@test.com')).resolves.toBe(true);
    await expect(verifyAdmin('former@test.com')).resolves.toBe(false);
    await expect(verifyAdmin('unknown@test.com')).resolves.toBe(false);
  });

  it('rejects a missing email', async () => {
    await expect(verifyAdmin(undefined)).resolves.toBe(false);
  });
});

describe('case-insensitive email lookup', () => {
  it('verifyAdmin finds legacy rows stored with mixed-case emails', async () => {
    findFirst.mockResolvedValue({isAdmin: true});

    await expect(verifyAdmin(' Legacy@Test.com ')).resolves.toBe(true);
    expect(renderWhere(findFirst.mock.calls[0])).toEqual(expect.objectContaining({
      sql: 'lower("users"."email") = $1',
      params: ['legacy@test.com'],
    }));
  });

  it('ensureAdminUser looks the user up case-insensitively', async () => {
    findFirst.mockResolvedValue({id: 'u1', email: 'Legacy@Test.com', isAdmin: true, acceptedAt: new Date(0)});

    await expect(ensureAdminUser('legacy@test.com')).resolves.toEqual({id: 'u1', email: 'Legacy@Test.com'});
    expect(renderWhere(findFirst.mock.calls[0]).sql).toBe('lower("users"."email") = $1');
    expect(insertValues).not.toHaveBeenCalled();
  });
});

describe('ensureAdminUser', () => {
  it('creates a user that is only an admin via ADMIN_EMAILS, accepted now', async () => {
    findFirst.mockResolvedValue(undefined);

    await expect(ensureAdminUser('admin@test.com')).resolves.toEqual({id: 'new-id', email: 'admin@test.com'});
    expect(insertValues).toHaveBeenCalledWith(expect.objectContaining({
      email: 'admin@test.com', isAdmin: true, acceptedAt: expect.any(Date),
    }));
  });

  it('sets acceptedAt on the first login of an invited user', async () => {
    findFirst.mockResolvedValue({id: 'u1', email: 'invited@test.com', isAdmin: true, acceptedAt: null});

    await expect(ensureAdminUser('invited@test.com')).resolves.toEqual({id: 'u1', email: 'invited@test.com'});
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({acceptedAt: expect.any(Date)}));
  });

  it('leaves an accepted user untouched', async () => {
    findFirst.mockResolvedValue({id: 'u1', email: 'invited@test.com', isAdmin: true, acceptedAt: new Date(0)});

    await ensureAdminUser('invited@test.com');
    expect(updateSet).not.toHaveBeenCalled();
  });

  it('grants isAdmin to an ADMIN_EMAILS user stored as non-admin', async () => {
    findFirst.mockResolvedValue({id: 'u1', email: 'admin@test.com', isAdmin: false, acceptedAt: new Date(0)});

    await ensureAdminUser('admin@test.com');
    expect(updateSet).toHaveBeenCalledWith(expect.objectContaining({isAdmin: true}));
  });
});

describe('safeReturnTo', () => {
  it.each([
    ['/admin', '/admin'],
    ['/admin/gebruikers', '/admin/gebruikers'],
    ['/admin?tab=1', '/admin?tab=1'],
    ['https://evil.example', '/admin'],
    ['//evil.example/admin', '/admin'],
    ['/administrator', '/admin'],
    ['/admin/login', '/admin'],
    ['/admin/login?error=link', '/admin'],
    ['/admin/login#x', '/admin'],
    ['/admin/loginx', '/admin/loginx'],
    ['/', '/admin'],
    [null, '/admin'],
    [undefined, '/admin'],
  ])('%s → %s', (input, expected) => {
    expect(safeReturnTo(input)).toBe(expected);
  });
});
