// @vitest-environment node
import sharp from 'sharp';
import {bestelUrl, qrPng, qrSvg} from '@lib/bestellingen/qr';

describe('qr', () => {
  it('links to the order page on the site', () => {
    vi.stubEnv('SITE_URL', 'https://talentenraad.be/');
    expect(bestelUrl('abc')).toBe('https://talentenraad.be/b/abc');
    vi.unstubAllEnvs();
  });

  it('makes an accessible SVG with a quiet zone', () => {
    const svg = qrSvg('hallo', 'QR-code <bestelling>');
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 29 29" role="img" aria-label="QR-code &lt;bestelling>"/);
    expect(svg).toContain('M4 4h1v1h-1z');
  });

  it('renders a square PNG', async () => {
    const png = await qrPng('hallo', 240);
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
    const meta = await sharp(png).metadata();
    expect([meta.width, meta.height]).toEqual([240, 240]);
  });
});
