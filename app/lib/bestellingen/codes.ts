import {randomBytes, randomInt} from 'node:crypto';

/** 128 random bits, base64url: 22 characters. Guessing one is not feasible. */
export function nieuwToken(): string {
  return randomBytes(16).toString('base64url');
}

export function isTokenVorm(value: string): boolean {
  return /^[\w-]{22}$/.test(value);
}

/** No characters that look alike: no 0/O and no 1/I. */
export const korteCodeTekens = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function nieuweKorteCode(): string {
  return Array.from({length: 6}, () => korteCodeTekens[randomInt(korteCodeTekens.length)]).join('');
}

/** `K7P4QX` → `K7P-4QX`. */
export function formatKorteCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** What someone types (`k7p-4qx `) → `K7P4QX`. */
export function normaliseerKorteCode(value: string): string {
  return value.toUpperCase().replaceAll(/[\s-]/g, '');
}
