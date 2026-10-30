// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {copyContentAssets} from '../../scripts/copy-content-assets.mjs';

const fixtures = path.join(__dirname, '../fixtures/content');

describe('copyContentAssets', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'content-assets-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, {recursive: true, force: true});
  });

  it('copies only non-text assets, keeping their relative path', async () => {
    const result = await copyContentAssets(fixtures, tmp);
    expect(result).toContain('activiteiten/met-foto/foto.png');
    expect(result).toContain('team/lid-a.png');
    expect(result.some(file => file.endsWith('.md') || file.endsWith('.yaml'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'content/activiteiten/met-foto/foto.png'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'content/site.yaml'))).toBe(false);
  });

  it('removes stale files from the destination first', async () => {
    fs.mkdirSync(path.join(tmp, 'content'), {recursive: true});
    fs.writeFileSync(path.join(tmp, 'content/oud.png'), 'x');
    await copyContentAssets(fixtures, tmp);
    expect(fs.existsSync(path.join(tmp, 'content/oud.png'))).toBe(false);
  });

  it('does nothing when the content dir does not exist', async () => {
    const result = await copyContentAssets(path.join(tmp, 'nope'), tmp);
    expect(result).toEqual([]);
    expect(fs.existsSync(path.join(tmp, 'content'))).toBe(false);
  });
});
