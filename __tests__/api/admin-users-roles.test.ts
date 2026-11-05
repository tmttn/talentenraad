// @vitest-environment node
import {NextRequest} from 'next/server';
import {eq} from 'drizzle-orm';
import {
  afterAll, beforeEach, describe, expect, it, vi,
} from 'vitest';
import type {createTestDb} from '../helpers/db';

const test = vi.hoisted(() => ({current: undefined as undefined | {db: unknown}}));
const getSession = vi.fn();

vi.mock('@lib/auth/session', () => ({getSession}));
vi.mock('@lib/email/messages', () => ({sendInvitationEmail: vi.fn().mockResolvedValue(undefined)}));
vi.mock('@lib/audit', () => ({logAudit: vi.fn(), createAuditContext: vi.fn()}));
vi.mock('@lib/db', async () => {
  const schema = await import('../../app/lib/db/schema');
  const {createTestDb} = await import('../helpers/db');
  const created = createTestDb();
  test.current = created;
  return {...schema, db: created.db};
});

const {users} = await import('@lib/db/schema');
const collection = await import('../../app/api/admin/users/route');
const item = await import('../../app/api/admin/users/[id]/route');
const testDb = test.current as unknown as ReturnType<typeof createTestDb>;

const adminSession = {user: {id: 'admin-id', email: 'boss@test.com', name: null, role: 'admin'}};
const json = (method: string, body: unknown) => new NextRequest('http://localhost:3000/api/admin/users', {
  method,
  body: JSON.stringify(body),
});

beforeEach(() => {
  testDb.reset();
  vi.stubEnv('ADMIN_EMAILS', 'boss@test.com');
  getSession.mockReset().mockResolvedValue(adminSession);
});

afterAll(() => {
  testDb.close();
});

describe('users API with roles', () => {
  it('invites a user with the redacteur role by default', async () => {
    const response = await collection.POST(json('POST', {email: 'New@Test.com'}));
    const body = await response.json() as {user: {role: string}};

    expect(response.status).toBe(200);
    expect(body.user.role).toBe('redacteur');
  });

  it('invites a beheerder when role is admin, and keeps the legacy flag in sync', async () => {
    await collection.POST(json('POST', {email: 'second@test.com', role: 'admin'}));

    const [row] = await testDb.db.select().from(users).where(eq(users.email, 'second@test.com'));
    expect(row.role).toBe('admin');
    expect(row.isAdmin).toBe(true);
  });

  it('rejects an unknown role', async () => {
    const response = await collection.POST(json('POST', {email: 'x@test.com', role: 'god'}));

    expect(response.status).toBe(400);
  });

  it('changes a role through PUT', async () => {
    const [editor] = await testDb.db.insert(users).values({email: 'editor@test.com', role: 'redacteur'}).returning();

    const response = await item.PUT(json('PUT', {role: 'admin'}), {params: Promise.resolve({id: editor.id})});

    expect(response.status).toBe(200);
    const [row] = await testDb.db.select().from(users).where(eq(users.id, editor.id));
    expect(row.role).toBe('admin');
  });

  it('refuses to demote yourself or an ADMIN_EMAILS user', async () => {
    const [boss] = await testDb.db.insert(users).values({email: 'boss@test.com', role: 'admin'}).returning();

    const response = await item.PUT(json('PUT', {role: 'redacteur'}), {params: Promise.resolve({id: boss.id})});

    expect(response.status).toBe(400);
    const [row] = await testDb.db.select().from(users).where(eq(users.id, boss.id));
    expect(row.role).toBe('admin');
  });
});

describe('users API: access to the bank account', () => {
  it('invites without access by default and with access when asked', async () => {
    await collection.POST(json('POST', {email: 'zonder@test.com'}));
    await collection.POST(json('POST', {email: 'met@test.com', bankToegang: true}));
    const rows = await testDb.db.select().from(users);
    expect(rows.find(row => row.email === 'zonder@test.com')?.bankToegang).toBe(false);
    expect(rows.find(row => row.email === 'met@test.com')?.bankToegang).toBe(true);
  });

  it('changes the flag apart from the role and refuses a non-boolean', async () => {
    const [created] = await testDb.db.insert(users).values({email: 'lid@test.com', role: 'redacteur'}).returning();
    const put = (body: unknown) => item.PUT(json('PUT', body), {params: Promise.resolve({id: created.id})});

    expect((await put({bankToegang: 'ja'})).status).toBe(400);
    expect((await put({bankToegang: true})).status).toBe(200);
    const [row] = await testDb.db.select().from(users).where(eq(users.id, created.id));
    expect(row).toMatchObject({bankToegang: true, role: 'redacteur'});
    await put({role: 'admin'});
    const [again] = await testDb.db.select().from(users).where(eq(users.id, created.id));
    expect(again).toMatchObject({bankToegang: true, role: 'admin'});
  });

  it('refuses a redacteur', async () => {
    getSession.mockResolvedValue({user: {...adminSession.user, email: 'r@test.com', role: 'redacteur'}});
    expect((await collection.POST(json('POST', {email: 'x@test.com', bankToegang: true}))).status).toBe(403);
  });
});
