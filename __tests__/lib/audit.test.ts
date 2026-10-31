// @vitest-environment node
import {NextRequest} from 'next/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const values = vi.fn();
const findFirst = vi.fn();

vi.mock('@lib/db', () => ({
  auditLogs: {},
  db: {
    insert: () => ({values}),
    query: {users: {findFirst}},
  },
}));

const {logAudit, createAuditContext} = await import('@lib/audit');

const request = new NextRequest('http://localhost:3000/api/admin/users', {
  method: 'POST',
  headers: {'x-forwarded-for': '1.2.3.4, 5.6.7.8', 'user-agent': 'test'},
});

beforeEach(() => {
  values.mockReset().mockResolvedValue(undefined);
  findFirst.mockReset();
});

describe('logAudit', () => {
  it('uses the session user id without looking the user up again', async () => {
    await logAudit({
      actionType: 'create',
      resourceType: 'user',
      context: createAuditContext(request, {user: {id: 'user-1', email: 'Admin@Test.com', name: 'Admin'}}),
    });

    expect(findFirst).not.toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      userEmail: 'admin@test.com',
      userName: 'Admin',
      ipAddress: '1.2.3.4',
      requestPath: '/api/admin/users',
      requestMethod: 'POST',
    }));
  });

  it('records an unknown user without a session', async () => {
    await logAudit({actionType: 'create', resourceType: 'user', context: createAuditContext(request, null)});

    expect(values).toHaveBeenCalledWith(expect.objectContaining({userId: null, userEmail: 'unknown'}));
  });
});
