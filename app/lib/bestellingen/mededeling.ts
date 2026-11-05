/**
 * Belgian structured payment reference (gestructureerde mededeling): 10 digits plus a check of
 * those 10 digits modulo 97 (0 becomes 97), written +++123/4567/89002+++. Banking apps check it,
 * so a typo is refused at the bank. Client-safe.
 */

const controle = (basis: number) => (basis % 97) || 97;

/** The reference of an order, from the running number over all sales: 12 digits. */
export function mededelingVoor(volgnummer: number): string {
  if (!Number.isInteger(volgnummer) || volgnummer < 1 || volgnummer > 9_999_999_999) {
    throw new RangeError(`Ongeldig volgnummer: ${volgnummer}`);
  }

  return `${String(volgnummer).padStart(10, '0')}${String(controle(volgnummer)).padStart(2, '0')}`;
}

const digits = (text: string) => text.replaceAll(/\D/g, '');

/** `000000001414` → `+++000/0000/01414+++`. */
export function formatMededeling(value: string): string {
  const d = digits(value);
  return `+++${d.slice(0, 3)}/${d.slice(3, 7)}/${d.slice(7, 12)}+++`;
}

/** True for 12 digits (with or without `+++` and slashes) whose check matches. */
export function isGeldigeMededeling(value: string): boolean {
  const d = digits(value);
  if (d.length !== 12 || !/^[+/*\d\s]+$/.test(value.trim())) {
    return false;
  }

  return Number(d.slice(10)) === controle(Number(d.slice(0, 10)));
}

/** Only the digits, for searching; undefined when it does not look like a reference. */
export function mededelingCijfers(value: string): string | undefined {
  return isGeldigeMededeling(value) ? digits(value) : undefined;
}
