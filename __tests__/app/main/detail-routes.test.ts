import {existsSync} from 'node:fs';
import path from 'node:path';

/**
 * A loading.tsx next to a detail page makes Next stream the response, so an
 * unknown slug answers 200 (instead of 404) and an alias slug gets a
 * meta-refresh (instead of a 308). The pages are static, so no skeleton is needed.
 */
describe('detail routes', () => {
  it.each(['activiteiten', 'nieuws'])('%s/[slug] has no loading.tsx', route => {
    const file = path.join(process.cwd(), 'app', '(main)', route, '[slug]', 'loading.tsx');
    expect(existsSync(file)).toBe(false);
  });
});
