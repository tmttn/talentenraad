import sharp from 'sharp';

const maxBytes = 10 * 1024 * 1024;
const maxSide = 1600;
const allowedFormats = new Set(['jpeg', 'png', 'webp']);

export class ImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageError';
  }
}

const notAPhoto = 'Dit bestand is geen foto (jpg, png of webp).';

/** Validates by content, applies EXIF orientation, resizes and re-encodes as JPEG without any metadata. */
export async function processImage(input: Buffer): Promise<{data: Buffer; ext: 'jpg'}> {
  if (input.length > maxBytes) {
    throw new ImageError('De foto is groter dan 10 MB.');
  }

  try {
    const metadata = await sharp(input).metadata();
    if (!metadata.format || !allowedFormats.has(metadata.format)) {
      throw new ImageError(notAPhoto);
    }

    // No withMetadata(): sharp then drops EXIF, ICC and XMP from the output.
    const data = await sharp(input)
      .rotate()
      .resize({width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true})
      .jpeg({quality: 82, mozjpeg: true})
      .toBuffer();
    return {data, ext: 'jpg'};
  } catch (error) {
    if (error instanceof ImageError) {
      throw error;
    }

    throw new ImageError(notAPhoto);
  }
}
