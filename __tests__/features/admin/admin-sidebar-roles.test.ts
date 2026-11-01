import {describe, expect, it} from 'vitest';
import {navItemsForRole} from '@features/admin/admin-sidebar';

describe('navItemsForRole', () => {
  it('shows everything to an admin', () => {
    expect(navItemsForRole('admin').map(item => item.label)).toEqual(['Dashboard', 'Content', 'Berichten', 'Gebruikers', 'Audit Logs']);
  });

  it('shows a redacteur the dashboard and content', () => {
    expect(navItemsForRole('redacteur').map(item => item.label)).toEqual(['Dashboard', 'Content']);
  });
});
