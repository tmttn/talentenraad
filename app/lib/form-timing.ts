import {createHmac, timingSafeEqual} from 'node:crypto';

/** Spam check without third parties: a form carries a signed "shown at" time; bots post faster than people type. */

export const minimumFillMs = 3000;
export const maximumAgeMs = 24 * 60 * 60 * 1000;
// A little leeway for a server clock that moves between showing and sending
const clockSkewMs = 5000;

export type FormTimingResult = 'ok' | 'too-fast' | 'expired' | 'invalid';

function secret(): string {
  const value = process.env.AUTH_SECRET ?? '';
  if (value.length < 32) {
    throw new Error('AUTH_SECRET ontbreekt of is korter dan 32 tekens');
  }

  return value;
}

// The purpose is part of what is signed, so a token for one form is useless for another
const sign = (purpose: string, issuedAt: number) => createHmac('sha256', secret())
  .update(`form-timing:${purpose}:${issuedAt}`)
  .digest('base64url');

/** A token for a form shown now: `<issued at in ms>.<signature>`. */
export function issueFormToken(purpose: string, now = Date.now()): string {
  return `${now}.${sign(purpose, now)}`;
}

export function checkFormToken(purpose: string, token: string | null | undefined, now = Date.now()): FormTimingResult {
  const match = /^(\d{1,16})\.([\w-]{43})$/.exec(token ?? '');
  if (!match) {
    return 'invalid';
  }

  const issuedAt = Number(match[1]);
  const expected = Buffer.from(sign(purpose, issuedAt));
  const given = Buffer.from(match[2]);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'invalid';
  }

  const age = now - issuedAt;
  if (age < -clockSkewMs) {
    return 'invalid';
  }

  if (age < minimumFillMs) {
    return 'too-fast';
  }

  return age > maximumAgeMs ? 'expired' : 'ok';
}
