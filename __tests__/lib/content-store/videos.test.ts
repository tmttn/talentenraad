// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {maxVideoBytes, processVideo, VideoError} from '@lib/content-store/videos';

const box = (type: string, ...children: Buffer[]) => {
  const body = Buffer.concat(children);
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + body.length, 0);
  header.write(type, 4, 'latin1');
  return Buffer.concat([header, body]);
};

const text = (value: string) => Buffer.from(value, 'latin1');
const ftyp = box('ftyp', text('isom'), Buffer.alloc(4), text('isomavc1'));
const mdat = box('mdat', text('beelden-en-geluid'));
const moov = box(
  'moov',
  box('mvhd', Buffer.alloc(20)),
  box('udta', box('©xyz', text('+50.9500+005.4500/'))),
  box('trak', box('tkhd', Buffer.alloc(12)), box('meta', text('com.apple.quicktime.location'))),
);
const movie = Buffer.concat([ftyp, moov, mdat]);

describe('processVideo', () => {
  it('blanks metadata boxes in place, so sizes and the media data stay the same', () => {
    const out = processVideo(movie);

    expect(out.length).toBe(movie.length);
    expect(out.toString('latin1')).not.toContain('+50.9500');
    expect(out.toString('latin1')).not.toContain('com.apple.quicktime.location');
    expect(out.toString('latin1')).not.toContain('udta');
    expect(out.subarray(out.length - mdat.length)).toEqual(mdat);
    expect(out.toString('latin1')).toContain('mvhd');
    expect(out.toString('latin1')).toContain('tkhd');
  });

  it('leaves the original buffer untouched', () => {
    const copy = Buffer.from(movie);
    processVideo(copy);
    expect(copy).toEqual(movie);
  });

  it('handles a 64-bit box size', () => {
    const large = Buffer.alloc(16 + 4);
    large.writeUInt32BE(1, 0);
    large.write('mdat', 4, 'latin1');
    large.writeBigUInt64BE(BigInt(large.length), 8);

    expect(processVideo(Buffer.concat([ftyp, moov, large])).length).toBe(ftyp.length + moov.length + large.length);
  });

  it.each([
    ['no ftyp first', Buffer.concat([moov, ftyp, mdat])],
    ['no moov', Buffer.concat([ftyp, mdat])],
    ['a truncated box', Buffer.concat([ftyp, moov.subarray(0, moov.length - 3)])],
    ['plain text', text('dit is geen filmpje, echt niet')],
  ])('refuses %s', (_label, input) => {
    expect(() => processVideo(input)).toThrow(VideoError);
  });

  it('refuses files over the limit before parsing', () => {
    const big = Buffer.alloc(8);
    Object.defineProperty(big, 'length', {value: maxVideoBytes + 1});

    expect(() => processVideo(big)).toThrow(/25 MB/);
  });
});
