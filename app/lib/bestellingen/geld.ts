/** Amounts are whole cents everywhere; these turn them into euro text and back. Client-safe. */

/** 1250 → `€ 12,50` (nl-BE, a space after the euro sign). */
export function formatEuro(cent: number): string {
  const sign = cent < 0 ? '-' : '';
  const absolute = Math.abs(Math.round(cent));
  const euros = Math.floor(absolute / 100).toLocaleString('nl-BE');
  return `${sign}€ ${euros},${String(absolute % 100).padStart(2, '0')}`;
}

/** 1250 → `12,50`: for an input field, without the euro sign. */
export function euroInvoer(cent: number): string {
  return formatEuro(cent).replace('€ ', '').replaceAll('.', '');
}

/**
 * Euro text from a form → cents. Accepts `12`, `12,5`, `12,50`, `12.50` and `€ 12,50`;
 * empty, negative, or more than two decimals gives undefined.
 */
export function parseEuro(text: string): number | undefined {
  const value = text.trim().replace(/^€\s*/, '');
  const match = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(value);
  if (!match) {
    return undefined;
  }

  return (Number(match[1]) * 100) + Number((match[2] ?? '0').padEnd(2, '0'));
}
