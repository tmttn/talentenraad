// @vitest-environment node
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createRateLimiter, getClientIp} from '@lib/rate-limit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows up to the limit and blocks after', () => {
    const limiter = createRateLimiter({limit: 3, windowMs: 1000});

    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('a')).toBe(false);
  });

  it('allows again once the window has passed', () => {
    const limiter = createRateLimiter({limit: 1, windowMs: 1000});

    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('a')).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter.check('a')).toBe(true);
  });

  it('slides the window instead of resetting it', () => {
    const limiter = createRateLimiter({limit: 2, windowMs: 1000});

    limiter.check('a');
    vi.advanceTimersByTime(600);
    limiter.check('a');
    vi.advanceTimersByTime(500);
    // The first hit has expired, the second has not.
    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('a')).toBe(false);
  });

  it('keeps separate keys apart', () => {
    const limiter = createRateLimiter({limit: 1, windowMs: 1000});

    expect(limiter.check('a')).toBe(true);
    expect(limiter.check('b')).toBe(true);
    expect(limiter.check('a')).toBe(false);
  });

  it('prunes expired keys periodically so memory stays bounded', () => {
    const limiter = createRateLimiter({limit: 1, windowMs: 1000});

    for (let index = 0; index < 100; index++) {
      limiter.check(`ip-${index}`);
    }

    expect(limiter.size()).toBe(100);
    vi.advanceTimersByTime(2500);
    expect(limiter.size()).toBe(0);
  });
});

describe('getClientIp', () => {
  it('uses the first x-forwarded-for value', () => {
    expect(getClientIp(new Headers({'x-forwarded-for': '1.1.1.1, 2.2.2.2'}))).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip, then unknown', () => {
    expect(getClientIp(new Headers({'x-real-ip': '3.3.3.3'}))).toBe('3.3.3.3');
    expect(getClientIp(new Headers())).toBe('unknown');
  });
});
