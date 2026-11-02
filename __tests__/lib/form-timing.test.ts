import {checkFormToken, issueFormToken, maximumAgeMs, minimumFillMs} from '@lib/form-timing';

vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));

const now = 1_800_000_000_000;

describe('form timing', () => {
  it('accepts a form sent after the minimum and before the maximum age', () => {
    expect(checkFormToken('contact', issueFormToken('contact', now - minimumFillMs), now)).toBe('ok');
    expect(checkFormToken('contact', issueFormToken('contact', now - maximumAgeMs), now)).toBe('ok');
  });

  it('flags forms sent too fast and forms left open too long', () => {
    expect(checkFormToken('contact', issueFormToken('contact', now - minimumFillMs + 1), now)).toBe('too-fast');
    expect(checkFormToken('contact', issueFormToken('contact', now - maximumAgeMs - 1), now)).toBe('expired');
  });

  it('rejects tampered, foreign, future and malformed tokens', () => {
    const token = issueFormToken('contact', now - 10_000);
    const [, signature] = token.split('.');
    expect(checkFormToken('contact', `${now - 60_000}.${signature}`, now)).toBe('invalid');
    expect(checkFormToken('feedback', token, now)).toBe('invalid');
    expect(checkFormToken('contact', issueFormToken('contact', now + 60_000), now)).toBe('invalid');
    for (const bad of ['', null, undefined, 'abc', `${now}.kort`, `${now}.${signature}.extra`]) {
      expect(checkFormToken('contact', bad, now)).toBe('invalid');
    }
  });

  it('depends on the secret', () => {
    const token = issueFormToken('contact', now - 10_000);
    vi.stubEnv('AUTH_SECRET', 'y'.repeat(40));
    expect(checkFormToken('contact', token, now)).toBe('invalid');
    vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
  });

  it('refuses to sign with a missing or short secret', () => {
    vi.stubEnv('AUTH_SECRET', 'kort');
    expect(() => issueFormToken('contact')).toThrow(/AUTH_SECRET/);
    vi.stubEnv('AUTH_SECRET', 'x'.repeat(40));
  });
});
