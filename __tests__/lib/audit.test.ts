// @vitest-environment node
import {NextRequest} from 'next/server';
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));

vi.mock('@lib/db', async () => {
  const schema = await import('../../app/lib/db/schema');
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {auditLogs, users} = await import('@lib/db/schema');
const {logAudit, createAuditContext, cleanupOldAuditLogs} = await import('@lib/audit');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

const request = new NextRequest('http://localhost:3000/api/admin/users', {
  method: 'POST',
  headers: {'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'user-agent': 'test'},
});

beforeEach(() => {
  testDb.reset();
});

afterAll(() => {
  testDb.close();
});

describe('logAudit (real SQLite)', () => {
  it('stores the session user and request metadata, with JSON columns round-tripped', async () => {
    const [user] = await testDb.db.insert(users).values({email: 'admin@test.com'}).returning();

    await logAudit({
      actionType: 'update',
      resourceType: 'user',
      resourceId: 'abc',
      dataBefore: {name: 'Oud'},
      dataAfter: {name: 'Nieuw', tags: ['a', 'b']},
      metadata: {bulk: [1, 2]},
      context: createAuditContext(request, {user: {id: user.id, email: 'Admin@Test.com', name: 'Admin'}}),
    });

    const [row] = await testDb.db.select().from(auditLogs);
    expect(row).toEqual(expect.objectContaining({
      actionType: 'update',
      resourceType: 'user',
      resourceId: 'abc',
      userId: user.id,
      userEmail: 'admin@test.com',
      userName: 'Admin',
      ipAddress: '1.2.3.4',
      userAgent: 'test',
      requestPath: '/api/admin/users',
      requestMethod: 'POST',
      dataBefore: {name: 'Oud'},
      dataAfter: {name: 'Nieuw', tags: ['a', 'b']},
      metadata: {bulk: [1, 2]},
    }));
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it('records an unknown user without a session', async () => {
    await logAudit({actionType: 'create', resourceType: 'user', context: createAuditContext(request, null)});

    const [row] = await testDb.db.select().from(auditLogs);
    expect(row.userId).toBeNull();
    expect(row.userEmail).toBe('unknown');
    expect(row.dataBefore).toBeNull();
  });

  it('does not throw when the insert fails (unknown user id violates the foreign key)', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(logAudit({
      actionType: 'create',
      resourceType: 'user',
      context: createAuditContext(request, {user: {id: 'does-not-exist', email: 'a@test.com'}}),
    })).resolves.toBeUndefined();

    expect(error).toHaveBeenCalled();
    expect(await testDb.db.select().from(auditLogs)).toHaveLength(0);
    error.mockRestore();
  });
});

describe('cleanupOldAuditLogs (real SQLite)', () => {
  const dayMs = 24 * 60 * 60 * 1000;

  const insertAt = async (daysAgo: number) => {
    await testDb.db.insert(auditLogs).values({
      actionType: 'login',
      resourceType: 'session',
      userEmail: `u${daysAgo}@test.com`,
      createdAt: new Date(Date.now() - (daysAgo * dayMs)),
    });
  };

  it('deletes only logs older than the retention period and returns the count', async () => {
    await insertAt(1);
    await insertAt(89);
    await insertAt(91);
    await insertAt(400);

    await expect(cleanupOldAuditLogs()).resolves.toBe(2);

    const left = await testDb.db.select().from(auditLogs);
    expect(left.map(row => row.userEmail).sort()).toEqual(['u1@test.com', 'u89@test.com']);
  });

  it('honours a custom retention and returns 0 when nothing is old', async () => {
    await insertAt(10);

    await expect(cleanupOldAuditLogs(30)).resolves.toBe(0);
    await expect(cleanupOldAuditLogs(5)).resolves.toBe(1);
  });
});
