import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const nextConfig = createRequire(import.meta.url)('../next.config.js') as {
  experimental?: {serverActions?: {bodySizeLimit?: string}; proxyClientMaxBodySize?: string};
};

describe('next.config', () => {
  it('allows 10 MB photos through server actions and the proxy', () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe('11mb');
    expect(nextConfig.experimental?.proxyClientMaxBodySize).toBe('11mb');
  });
});
