import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const nextConfig = createRequire(import.meta.url)('../next.config.js') as {
  experimental?: {serverActions?: {bodySizeLimit?: string}; proxyClientMaxBodySize?: string};
};

describe('next.config', () => {
  it('allows a 25 MB video plus photos through server actions and the proxy', () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe('40mb');
    expect(nextConfig.experimental?.proxyClientMaxBodySize).toBe('40mb');
  });
});
