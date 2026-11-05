import sharp from 'sharp';
import {getSiteUrl} from '@lib/email/mailer';
import {encodeQr} from './qr-encoder';

const quietZone = 4;

/** The link in the QR code: only the token, no name or order number. */
export function bestelUrl(token: string): string {
  return `${getSiteUrl()}/b/${token}`;
}

/** An SVG of the QR code with a quiet zone of 4 modules; black on white, one path. */
export function qrSvg(text: string, label = 'QR-code'): string {
  const modules = encodeQr(text);
  const size = modules.length + (quietZone * 2);
  let path = '';
  for (const [y, row] of modules.entries()) {
    for (const [x, dark] of row.entries()) {
      if (dark) {
        path += `M${x + quietZone} ${y + quietZone}h1v1h-1z`;
      }
    }
  }

  const escaped = label.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escaped}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${path}" fill="#000000"/></svg>`;
}

/** A PNG of the QR code for mails (most mail apps do not show SVG). */
export async function qrPng(text: string, pixels = 480): Promise<Buffer> {
  return sharp(Buffer.from(qrSvg(text)), {density: 300})
    .resize(pixels, pixels, {kernel: 'nearest'})
    .png()
    .toBuffer();
}
