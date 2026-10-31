// @vitest-environment node
import {
  afterAll, describe, expect, it, vi,
} from 'vitest';
import Database from 'better-sqlite3';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {client: {close(): void}}}));
const state = vi.hoisted(() => ({override: undefined as unknown}));

vi.mock('@lib/db', async () => {
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {
    db: new Proxy({}, {
      get(_target, property) {
        const target = (state.override ?? created.db) as Record<string | symbol, unknown>;
        const value = target[property];
        return typeof value === 'function' ? value.bind(target) as unknown : value;
      },
    }),
  };
});

const {GET} = await import('../../app/api/health/route');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

afterAll(() => {
  testDb.close();
});

describe('GET /api/health', () => {
  it('returns 200 when the database answers', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ok: true});
  });

  it('returns 503 when the schema is not migrated', async () => {
    const empty = new Database(':memory:');
    const {drizzle} = await import('drizzle-orm/better-sqlite3');
    state.override = drizzle(empty);
    const response = GET();
    state.override = undefined;
    empty.close();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ok: false});
  });

  it('returns 503 without details when the database is closed', async () => {
    testDb.close();
    const response = GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ok: false});
  });
});
