import {describe, expect, it} from 'vitest';
import {navItemsForRole} from '@features/admin/admin-sidebar';

describe('navItemsForRole', () => {
  it('shows everything to an admin', () => {
    expect(navItemsForRole('admin').map(item => item.label)).toEqual(['Dashboard', 'Berichten', 'Gebruikers', 'Audit Logs']);
  });

  it('shows a redacteur only the dashboard', () => {
    expect(navItemsForRole('redacteur').map(item => item.label)).toEqual(['Dashboard']);
  });
});
