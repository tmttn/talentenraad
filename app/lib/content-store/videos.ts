/** Largest video the editor accepts. Bigger files make every clone of the (public) repo heavier. */
export const maxVideoBytes = 25 * 1024 * 1024;

export class VideoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VideoError';
  }
}

const notAVideo = 'Dit bestand is geen mp4-filmpje.';

/** Boxes that only group other boxes; we walk into them to find metadata. */
const containers = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf']);
/** Boxes with user data: GPS position (`©xyz`, Apple's location key), device, owner, dates. */
const metadata = new Set(['udta', 'meta', 'uuid', 'XMP_']);

type Box = {type: string; start: number; headerSize: number; end: number};

function readBox(data: Buffer, offset: number, limit: number): Box | undefined {
  if (offset + 8 > limit) {
    return undefined;
  }

  let size = data.readUInt32BE(offset);
  const type = data.toString('latin1', offset + 4, offset + 8);
  let headerSize = 8;
  if (size === 1) {
    if (offset + 16 > limit) {
      return undefined;
    }

    const big = data.readBigUInt64BE(offset + 8);
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) {
      return undefined;
    }

    size = Number(big);
    headerSize = 16;
  } else if (size === 0) {
    size = limit - offset; // Runs to the end of its parent
  }

  if (size < headerSize || offset + size > limit) {
    return undefined;
  }

  return {type, start: offset, headerSize, end: offset + size};
}

/**
 * Turns every metadata box into a `free` box of the same size filled with zeros. Nothing moves,
 * so the sample offsets in `stco`/`co64` stay right and the video plays as before.
 */
function blankMetadata(data: Buffer, start: number, end: number, depth: number): void {
  let offset = start;
  while (offset < end) {
    const box = readBox(data, offset, end);
    if (!box) {
      throw new VideoError(notAVideo);
    }

    if (metadata.has(box.type) && depth > 0) {
      data.write('free', box.start + 4, 'latin1');
      data.fill(0, box.start + box.headerSize, box.end);
    } else if (containers.has(box.type) && depth < 8) {
      blankMetadata(data, box.start + box.headerSize, box.end, depth + 1);
    }

    offset = box.end;
  }
}

/**
 * Checks that the upload is an MP4 (an `ftyp` box first, a `moov` box somewhere) and returns a copy
 * without its metadata. The video itself is not re-encoded: phones already make web-friendly files.
 */
export function processVideo(input: Buffer): Buffer {
  if (input.length > maxVideoBytes) {
    throw new VideoError('Het filmpje is groter dan 25 MB. Kort het in of verklein het op je telefoon.');
  }

  const first = readBox(input, 0, input.length);
  if (!first || first.type !== 'ftyp') {
    throw new VideoError(notAVideo);
  }

  const data = Buffer.from(input);
  let offset = 0;
  let hasMovie = false;
  while (offset < data.length) {
    const box = readBox(data, offset, data.length);
    if (!box) {
      throw new VideoError(notAVideo);
    }

    if (box.type === 'moov') {
      hasMovie = true;
      blankMetadata(data, box.start + box.headerSize, box.end, 1);
    } else if (metadata.has(box.type)) {
      // Top-level metadata (some cameras write it there)
      data.write('free', box.start + 4, 'latin1');
      data.fill(0, box.start + box.headerSize, box.end);
    }

    offset = box.end;
  }

  if (!hasMovie) {
    throw new VideoError(notAVideo);
  }

  return data;
}
