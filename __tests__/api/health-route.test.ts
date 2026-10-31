// @vitest-environment node
import {
  afterAll, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {client: {close(): void}}}));

vi.mock('@lib/db', async () => {
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {db: created.db};
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

  it('returns 503 without details when the database is closed', async () => {
    testDb.close();
    const response = GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ok: false});
  });
});
