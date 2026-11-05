import {doorWie, kanBeheren, kanBetalingBevestigen} from '@lib/bestellingen/rechten';

const wie = (role: 'admin' | 'redacteur', bankToegang: boolean, name: string | null = null) => ({user: {role, bankToegang, name, email: 'lid@example.com'}});

describe('rechten', () => {
  it('lets admins and editors manage orders', () => {
    expect(kanBeheren(wie('admin', false))).toBe(true);
    expect(kanBeheren(wie('redacteur', false))).toBe(true);
  });

  it('lets only members with access to the bank account confirm payments', () => {
    expect(kanBetalingBevestigen(wie('admin', false))).toBe(false);
    expect(kanBetalingBevestigen(wie('redacteur', true))).toBe(true);
  });

  it('names a member by name, else by e-mail', () => {
    expect(doorWie(wie('admin', false, 'Sara'))).toBe('Sara');
    expect(doorWie(wie('admin', false, ' '))).toBe('lid@example.com');
  });
});
