/** IBAN checks for the account of a sale (`betalen.rekening` in content/acties/). Client-safe: no node imports. */

/** The example number from the specification: a sale with this account never opens in production. */
export const voorbeeldIban = 'BE68539007547034';

const compact = (value: string) => value.replaceAll(/\s+/g, '').toUpperCase();

const lengths: Record<string, number> = {BE: 16, NL: 18, LU: 20, FR: 27, DE: 22};

/** Country code, length (for the countries we expect) and the ISO 13616 modulo 97 check. */
export function isGeldigeIban(value: string): boolean {
  const iban = compact(value);
  if (!/^[A-Z]{2}\d{2}[A-Z\d]{10,30}$/.test(iban)) {
    return false;
  }

  const expected = lengths[iban.slice(0, 2)];
  if (expected !== undefined && iban.length !== expected) {
    return false;
  }

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const character of rearranged) {
    const digits = /\d/.test(character) ? character : String(character.charCodeAt(0) - 55);
    for (const digit of digits) {
      remainder = ((remainder * 10) + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

/** `BE68539007547034` → `BE68 5390 0754 7034`. */
export function formatIban(value: string): string {
  return compact(value).replaceAll(/(.{4})(?=.)/g, '$1 ');
}

export function isVoorbeeldRekening(iban: string): boolean {
  return compact(iban) === voorbeeldIban;
}
