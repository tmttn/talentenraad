// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {getClientIp} from '@lib/rate-limit';

describe('getClientIp', () => {
  it('uses the first x-forwarded-for value', () => {
    expect(getClientIp(new Headers({'x-forwarded-for': '1.1.1.1, 2.2.2.2'}))).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip, then unknown', () => {
    expect(getClientIp(new Headers({'x-real-ip': '3.3.3.3'}))).toBe('3.3.3.3');
    expect(getClientIp(new Headers())).toBe('unknown');
  });

  it('treats an empty or whitespace x-forwarded-for as missing', () => {
    expect(getClientIp(new Headers({'x-forwarded-for': '  ', 'x-real-ip': '4.4.4.4'}))).toBe('4.4.4.4');
    expect(getClientIp(new Headers({'x-forwarded-for': ''}))).toBe('unknown');
    expect(getClientIp(new Headers({'x-forwarded-for': ' , 2.2.2.2', 'x-real-ip': ' '}))).toBe('unknown');
  });
});
