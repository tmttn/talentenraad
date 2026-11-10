import {describe, expect, it} from 'vitest';
import {isAdminApi} from '@features/admin/session-validator';

describe('isAdminApi', () => {
  it('reads strings, URL objects and Requests', () => {
    expect(isAdminApi('/api/admin/users')).toBe(true);
    expect(isAdminApi(new URL('/api/admin/users', globalThis.location.origin))).toBe(true);
    expect(isAdminApi(new Request(new URL('/api/admin/users', globalThis.location.origin)))).toBe(true);
  });

  it('does not throw on the router\'s URL objects for pages', () => {
    expect(isAdminApi(new URL('/admin/bestellingen?_rsc=1', globalThis.location.origin))).toBe(false);
    expect(isAdminApi('/api/feedback/token')).toBe(false);
  });
});
