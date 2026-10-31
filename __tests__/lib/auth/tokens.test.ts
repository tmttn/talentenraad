// @vitest-environment node
import {createHash} from 'node:crypto';
import {type SQL} from 'drizzle-orm';
import {PgDialect} from 'drizzle-orm/pg-core';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

type Row = {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | undefined;
  createdAt: Date;
};

const dialect = new PgDialect();
const rows: Row[] = [];

function render(condition: SQL) {
  return dialect.sqlToQuery(condition);
}

/**
 * Minimal in-memory stand-in for the two queries tokens.ts runs. It asserts the
 * exact SQL shape so the atomic single-use update cannot silently change.
 */
const fakeDb = {
  select: () => ({
    from: () => ({
      async where(condition: SQL) {
        const {sql, params} = render(condition);
        expect(sql).toBe('("login_tokens"."email" = $1 and "login_tokens"."created_at" > $2)');
        const [email, since] = params as [string, string];
        const value = rows.filter(row => row.email === email && row.createdAt > new Date(since)).length;
        return [{value}];
      },
    }),
  }),
  insert: () => ({
    async values(row: Omit<Row, 'usedAt'>) {
      rows.push({...row, usedAt: undefined});
    },
  }),
  update: () => ({
    set: ({usedAt}: {usedAt: Date}) => ({
      where: (condition: SQL) => ({
        async returning() {
          const {sql, params} = render(condition);
          expect(sql).toBe('("login_tokens"."token_hash" = $1 and "login_tokens"."used_at" is null and "login_tokens"."expires_at" > $2)');
          const [hash, now] = params as [string, string];
          const row = rows.find(candidate => candidate.tokenHash === hash
            && candidate.usedAt === undefined
            && candidate.expiresAt > new Date(now));
          if (!row) {
            return [];
          }

          row.usedAt = usedAt;
          return [{email: row.email}];
        },
      }),
    }),
  }),
};

vi.mock('@lib/db', async () => {
  const schema = await import('../../../app/lib/db/schema');
  return {...schema, db: fakeDb};
});

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

describe('login tokens', () => {
  beforeEach(() => {
    rows.length = 0;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-31T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a 32-byte base64url token and stores only its sha256 hex hash', async () => {
    const {createLoginToken} = await import('@lib/auth/tokens');

    const token = await createLoginToken('Admin@Example.com ');

    expect(token).toMatch(/^[\w-]{43}$/);
    expect(Buffer.from(token!, 'base64url')).toHaveLength(32);
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
    expect(rows[0].tokenHash).toBe(sha256(token!));
    expect(rows[0].email).toBe('admin@example.com');
    expect(rows[0].expiresAt).toEqual(new Date('2026-10-31T10:15:00Z'));
  });

  it('consumes a valid token once and fails the second time', async () => {
    const {createLoginToken, consumeLoginToken} = await import('@lib/auth/tokens');
    const token = await createLoginToken('admin@example.com');

    await expect(consumeLoginToken(token!)).resolves.toEqual({email: 'admin@example.com'});
    await expect(consumeLoginToken(token!)).resolves.toBeUndefined();
  });

  it('rejects an expired token', async () => {
    const {createLoginToken, consumeLoginToken} = await import('@lib/auth/tokens');
    const token = await createLoginToken('admin@example.com');

    vi.setSystemTime(new Date('2026-10-31T10:15:01Z'));

    await expect(consumeLoginToken(token!)).resolves.toBeUndefined();
  });

  it('rejects unknown and empty tokens', async () => {
    const {consumeLoginToken} = await import('@lib/auth/tokens');

    await expect(consumeLoginToken('onbekend')).resolves.toBeUndefined();
    await expect(consumeLoginToken('')).resolves.toBeUndefined();
  });

  it('allows 5 requests per email per 15 minutes, used tokens included', async () => {
    const {createLoginToken, consumeLoginToken} = await import('@lib/auth/tokens');

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
