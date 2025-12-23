import {spawnSync} from 'node:child_process';
import {createSerwistRoute} from '@serwist/turbopack';

// Get git revision for cache busting
const revision = spawnSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).stdout?.trim() ?? crypto.randomUUID();

export const {dynamic, dynamicParams, revalidate, generateStaticParams, GET} = createSerwistRoute({
	additionalPrecacheEntries: [{url: '/offline', revision}],
	swSrc: 'app/sw.ts',
	nextConfig: {},
});
