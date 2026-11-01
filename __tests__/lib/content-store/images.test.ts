// @vitest-environment node
import {crc32} from 'node:zlib';
import sharp from 'sharp';
import {describe, expect, it} from 'vitest';
import {ImageError, processImage} from '@lib/content-store/images';

/** A small PNG whose header claims other dimensions (a "decompression bomb" without the cost of encoding one). */
const withClaimedSize = (png: Buffer, width: number, height: number) => {
  const out = Buffer.from(png);
  // Signature (8) + length (4) + "IHDR" (4), then width and height; the chunk CRC follows the 13-byte IHDR data.
  out.writeUInt32BE(width, 16);
  out.writeUInt32BE(height, 20);
  out.writeUInt32BE(crc32(out.subarray(12, 29)), 29);
  return out;
};

const solid = (width: number, height: number) => sharp({create: {width, height, channels: 3, background: {r: 200, g: 100, b: 50}}, limitInputPixels: false});

describe('processImage', () => {
  it('strips EXIF including GPS', async () => {
    const input = await solid(100, 80).withExif({
      IFD0: {Copyright: 'fictief'},
      IFD3: {GPSLatitudeRef: 'N', GPSLatitude: '50/1 0/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '5/1 0/1 0/1'},
    }).jpeg().toBuffer();
    expect((await sharp(input).metadata()).exif).toBeDefined();

    const {data, ext} = await processImage(input);
    expect(ext).toBe('jpg');
    const meta = await sharp(data).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.exif).toBeUndefined();
    expect(data.includes(Buffer.from('fictief'))).toBe(false);
  });

  it('shrinks 4000x3000 to 1600x1200', async () => {
    const {data} = await processImage(await solid(4000, 3000).png().toBuffer());
    const meta = await sharp(data).metadata();
    expect([meta.width, meta.height]).toEqual([1600, 1200]);
  });

  it('does not enlarge small images and accepts webp', async () => {
    const {data} = await processImage(await solid(300, 200).webp().toBuffer());
    const meta = await sharp(data).metadata();
    expect([meta.width, meta.height, meta.format]).toEqual([300, 200, 'jpeg']);
  });

  it('applies EXIF orientation', async () => {
    const input = await solid(200, 100).withMetadata({orientation: 6}).jpeg().toBuffer();
    expect((await sharp(input).metadata()).orientation).toBe(6);
    const {data} = await processImage(input);
    const meta = await sharp(data).metadata();
    expect([meta.width, meta.height]).toEqual([100, 200]);
    expect(meta.orientation).toBeUndefined();
  });

  it('rejects text pretending to be a jpg', async () => {
    const promise = processImage(Buffer.from('dit is geen foto'));
    await expect(promise).rejects.toBeInstanceOf(ImageError);
    await expect(promise).rejects.toThrow('Dit bestand is geen foto (jpg, png of webp).');
  });

  it('rejects other image formats', async () => {
    await expect(processImage(await solid(10, 10).gif().toBuffer())).rejects.toThrow('Dit bestand is geen foto (jpg, png of webp).');
  });

  it('rejects files over 10 MB', async () => {
    await expect(processImage(Buffer.alloc(11 * 1024 * 1024))).rejects.toThrow('De foto is groter dan 10 MB.');
  });

  it('rejects a tiny file with huge dimensions', async () => {
    const input = withClaimedSize(await solid(16, 16).png().toBuffer(), 20000, 20000);
    expect((await sharp(input, {limitInputPixels: false}).metadata()).width).toBe(20000);
    await expect(processImage(input)).rejects.toThrow('De foto is te groot.');
  });
});
