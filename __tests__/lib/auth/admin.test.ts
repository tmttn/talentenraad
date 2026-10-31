// @vitest-environment node
import {eq} from 'drizzle-orm';
import {
  afterAll, afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));

vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {users} = await import('@lib/db/schema');
const {
  isAdminEmail, verifyAdmin, normalizeEmail, ensureAdminUser, safeReturnTo,
} = await import('@lib/auth/admin');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

beforeEach(() => {
  testDb.reset();
  vi.stubEnv('ADMIN_EMAILS', 'admin@test.com');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

afterAll(() => {
  testDb.close();
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

describe('verifyAdmin (real SQLite)', () => {
  it('accepts ADMIN_EMAILS without a users row', async () => {
    await expect(verifyAdmin('Admin@test.com')).resolves.toBe(true);
  });

  it('falls back to users.isAdmin', async () => {
    await testDb.db.insert(users).values([
      {email: 'db-admin@test.com', isAdmin: true},
      {email: 'former@test.com', isAdmin: false},
    ]);

    await expect(verifyAdmin('db-admin@test.com')).resolves.toBe(true);
    await expect(verifyAdmin('former@test.com')).resolves.toBe(false);
    await expect(verifyAdmin('unknown@test.com')).resolves.toBe(false);
  });

  it('rejects a missing email', async () => {
    await expect(verifyAdmin(undefined)).resolves.toBe(false);
  });

  it('finds legacy rows stored with mixed-case emails, ignoring case and whitespace', async () => {
    await testDb.db.insert(users).values({email: 'Legacy@Test.com', isAdmin: true});

    await expect(verifyAdmin(' LEGACY@test.COM ')).resolves.toBe(true);
    await expect(verifyAdmin('legacy@test.com')).resolves.toBe(true);
  });
});

describe('ensureAdminUser (real SQLite)', () => {
  it('creates a user that is only an admin via ADMIN_EMAILS, accepted now', async () => {
    const created = await ensureAdminUser(' Admin@Test.com ');

    expect(created.email).toBe('admin@test.com');
    const [row] = await testDb.db.select().from(users).where(eq(users.id, created.id));
    expect(row.isAdmin).toBe(true);
    expect(row.acceptedAt).toBeInstanceOf(Date);
  });

  it('looks an existing user up case-insensitively and does not create a duplicate', async () => {
    const [existing] = await testDb.db.insert(users)
      .values({email: 'Legacy@Test.com', isAdmin: true, acceptedAt: new Date(0)})
      .returning();

    await expect(ensureAdminUser('legacy@test.com')).resolves.toEqual({id: existing.id, email: 'Legacy@Test.com'});
    expect(await testDb.db.select().from(users)).toHaveLength(1);
    const [row] = await testDb.db.select().from(users);
    expect(row.acceptedAt).toEqual(new Date(0));
  });

  it('sets acceptedAt on the first login of an invited user', async () => {
    const [invited] = await testDb.db.insert(users)
      .values({email: 'invited@test.com', isAdmin: true})
      .returning();

    await ensureAdminUser('invited@test.com');

    const [row] = await testDb.db.select().from(users).where(eq(users.id, invited.id));
    expect(row.acceptedAt).toBeInstanceOf(Date);
    expect(row.isAdmin).toBe(true);
  });

  it('grants isAdmin to an ADMIN_EMAILS user stored as non-admin', async () => {
    const [stored] = await testDb.db.insert(users)
      .values({email: 'admin@test.com', isAdmin: false, acceptedAt: new Date(0)})
      .returning();

    await ensureAdminUser('admin@test.com');

    const [row] = await testDb.db.select().from(users).where(eq(users.id, stored.id));
    expect(row.isAdmin).toBe(true);
    expect(row.acceptedAt).toEqual(new Date(0));
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
