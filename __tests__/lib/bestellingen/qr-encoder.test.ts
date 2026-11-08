// @vitest-environment node
import {
  alignmentPositions, dataCodewords, encodeQr, formatBits, reedSolomonDivisor, reedSolomonRemainder, versionBits,
} from '@lib/bestellingen/qr-encoder';

describe('QR encoder building blocks', () => {
  it('computes Reed-Solomon error correction (HELLO WORLD, 1-Q)', () => {
    const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236];
    expect(reedSolomonRemainder(data, reedSolomonDivisor(13))).toEqual([168, 72, 22, 82, 217, 54, 156, 0, 46, 15, 180, 122, 16]);
  });

  it('has the format and version bits of the standard', () => {
    expect(formatBits(0).toString(2).padStart(15, '0')).toBe('101010000010010');
    expect(formatBits(5).toString(2).padStart(15, '0')).toBe('100000011001110');
    expect(versionBits(7).toString(2).padStart(18, '0')).toBe('000111110010010100');
  });

  it('knows capacities and alignment positions', () => {
    expect([1, 2, 3, 4, 7, 10].map(dataCodewords)).toEqual([16, 28, 44, 64, 124, 216]);
    expect(alignmentPositions(1)).toEqual([]);
    expect(alignmentPositions(4)).toEqual([6, 26]);
    expect(alignmentPositions(7)).toEqual([6, 22, 38]);
    expect(alignmentPositions(10)).toEqual([6, 28, 50]);
  });
});

describe('encodeQr', () => {
  it('picks the smallest version that fits', () => {
    expect(encodeQr('https://talentenraad.be/b/AAAAAAAAAAAAAAAAAAAAAA')).toHaveLength(33);
    expect(encodeQr('a')).toHaveLength(21);
    expect(encodeQr('x'.repeat(150))).toHaveLength(49);
    expect(encodeQr('x'.repeat(200))).toHaveLength(57);
    expect(() => encodeQr('x'.repeat(300))).toThrow();
  });

  it('draws the finder patterns and the dark module', () => {
    const modules = encodeQr('https://talentenraad.be/b/AAAAAAAAAAAAAAAAAAAAAA');
    const size = modules.length;
    const row = (y: number, x: number) => modules[y].slice(x, x + 7).map(dark => (dark ? 1 : 0)).join('');
    for (const [x, y] of [[0, 0], [size - 7, 0], [0, size - 7]]) {
      expect(row(y, x)).toBe('1111111');
      expect(row(y + 1, x)).toBe('1000001');
      expect(row(y + 3, x)).toBe('1011101');
    }

    expect(modules[size - 8][8]).toBe(true);
  });
});

describe('encodeQr read back by jsQR (the scanner of the pickup app on iPhone)', () => {
  // Renders the matrix as RGBA pixels: 4 px per module and a quiet zone of 4 modules, as on a screen
  function pixels(matrix: boolean[][]) {
    const schaal = 4;
    const rand = 4;
    const size = (matrix.length + (2 * rand)) * schaal;
    const data = new Uint8ClampedArray(size * size * 4).fill(255);
    for (const [y, rij] of matrix.entries()) {
      for (const [x, donker] of rij.entries()) {
        if (!donker) {
          continue;
        }

        for (let dy = 0; dy < schaal; dy++) {
          for (let dx = 0; dx < schaal; dx++) {
            const index = ((((y + rand) * schaal) + dy) * size + (((x + rand) * schaal) + dx)) * 4;
            data.fill(0, index, index + 3);
          }
        }
      }
    }

    return {data, size};
  }

  it.each([
    'https://talentenraad.be/b/AbCdEfGhIjKlMnOpQrSt_-',
    'http://localhost:3000/b/0123456789abcdefghij-_',
    `https://talentenraad.be/${'lang/'.repeat(30)}`,
  ])('decodes %s', async text => {
    const {default: jsQR} = await import('jsqr');
    const {data, size} = pixels(encodeQr(text));

    expect(jsQR(data, size, size, {inversionAttempts: 'dontInvert'})?.data).toBe(text);
  });
});
