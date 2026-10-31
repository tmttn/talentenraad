// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';

describe('lazy database', () => {
  afterEach(() => {
    vi.resetModules();
    delete (globalThis as {talentenraadDb?: unknown}).talentenraadDb;
    vi.unstubAllEnvs();
  });

  it('does not create the database file on import, only on first use', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lazy-db-'));
    const file = path.join(dir, 'sub', 'test.db');
    vi.stubEnv('DATABASE_PATH', file);

    const {db} = await import('@lib/db');
    expect(fs.existsSync(file)).toBe(false);

    expect(typeof db.select).toBe('function');
    expect(fs.existsSync(file)).toBe(true);

    (globalThis as unknown as {talentenraadDb: {client: {close(): void}}}).talentenraadDb.client.close();
    fs.rmSync(dir, {recursive: true, force: true});
  });
});
