// @vitest-environment node
import {createHash} from 'node:crypto';
import {
  afterAll, afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import {createTestDb} from '../../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));

vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  const {createTestDb} = await import('../../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {loginTokens} = await import('@lib/db/schema');
const {createLoginToken, consumeLoginToken} = await import('@lib/auth/tokens');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

describe('login tokens (real SQLite)', () => {
  beforeEach(() => {
    testDb.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(() => {
    testDb.close();
  });

  it('creates a 32-byte base64url token and stores only its sha256 hex hash', async () => {
    const token = await createLoginToken('Admin@Example.com ');

    expect(token).toMatch(/^[\w-]{43}$/);
    expect(Buffer.from(token!, 'base64url')).toHaveLength(32);
    const rows = await testDb.db.select().from(loginTokens);
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
    expect(rows[0].tokenHash).toBe(sha256(token!));
    expect(rows[0].email).toBe('admin@example.com');
    expect(rows[0].expiresAt).toEqual(new Date('2026-10-31T10:15:00Z'));
    expect(rows[0].usedAt).toBeNull();
  });

  it('consumes a valid token once and fails the second time', async () => {
    const token = await createLoginToken('admin@example.com');

    await expect(consumeLoginToken(token!)).resolves.toEqual({email: 'admin@example.com'});
    await expect(consumeLoginToken(token!)).resolves.toBeUndefined();
    const [row] = await testDb.db.select().from(loginTokens);
    expect(row.usedAt).toEqual(new Date('2026-10-31T10:00:00Z'));
  });

  it('only one of two simultaneous consumers wins', async () => {
    const token = await createLoginToken('admin@example.com');

    const results = await Promise.all([consumeLoginToken(token!), consumeLoginToken(token!)]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });

  it('rejects an expired token and does not mark it used', async () => {
    const token = await createLoginToken('admin@example.com');

    vi.setSystemTime(new Date('2026-10-31T10:15:01Z'));

    await expect(consumeLoginToken(token!)).resolves.toBeUndefined();
    const [row] = await testDb.db.select().from(loginTokens);
    expect(row.usedAt).toBeNull();
  });

  it('still accepts a token just before it expires', async () => {
    const token = await createLoginToken('admin@example.com');

    vi.setSystemTime(new Date('2026-10-31T10:14:59Z'));

    await expect(consumeLoginToken(token!)).resolves.toEqual({email: 'admin@example.com'});
  });

  it('rejects unknown and empty tokens', async () => {
    await expect(consumeLoginToken('onbekend')).resolves.toBeUndefined();
    await expect(consumeLoginToken('')).resolves.toBeUndefined();
  });

  it('allows 5 requests per email per 15 minutes, used tokens included', async () => {
    const first = await createLoginToken('admin@example.com');
    await consumeLoginToken(first!);
    for (let index = 0; index < 4; index++) {
      expect(await createLoginToken('admin@example.com')).toBeDefined();
    }

    await expect(createLoginToken('ADMIN@example.com')).resolves.toBeUndefined();
    await expect(createLoginToken('other@example.com')).resolves.toBeDefined();

    vi.setSystemTime(new Date('2026-10-31T10:15:01Z'));
    await expect(createLoginToken('admin@example.com')).resolves.toBeDefined();
  });
});
