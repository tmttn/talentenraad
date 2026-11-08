import {describe, expect, it} from 'vitest';
import {navItemsForRole} from '@features/admin/admin-sidebar';

describe('navItemsForRole', () => {
  it('shows everything to an admin', () => {
    expect(navItemsForRole('admin').map(item => item.label)).toEqual(['Dashboard', 'Content', 'Bestellingen', 'Afhalen', 'Berichten', 'Gebruikers', 'Audit Logs']);
  });

  it('shows a redacteur the dashboard, content, orders and the pickup app', () => {
    expect(navItemsForRole('redacteur').map(item => item.label)).toEqual(['Dashboard', 'Content', 'Bestellingen', 'Afhalen']);
  });
});
