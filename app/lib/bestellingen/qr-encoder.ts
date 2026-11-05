/**
 * QR code encoder (ISO/IEC 18004): byte mode, error correction level M, versions 1 to 10 (up to
 * 213 bytes, plenty for a /b/<token> link). Follows the structure of Project Nayuki's reference
 * implementation (MIT). No dependencies, so it runs on the server and in the mail.
 */

/** Error correction codewords per block and number of blocks for level M, versions 1–10. */
const eccPerBlock = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const blocks = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const maxVersion = 10;
/** Format bits of error correction level M. */
const formatBitsM = 0;

const bit = (value: number, index: number) => ((value >>> index) & 1) !== 0;

/** Data and function modules in a version, minus the function patterns (finder, timing, alignment, format, version). */
function rawDataModules(version: number): number {
  let result = (((16 * version) + 128) * version) + 64;
  if (version >= 2) {
    const align = Math.floor(version / 7) + 2;
    result -= (((25 * align) - 10) * align) - 55;
    if (version >= 7) {
      result -= 36;
    }
  }

  return result;
}

const totalCodewords = (version: number) => Math.floor(rawDataModules(version) / 8);
export const dataCodewords = (version: number) => totalCodewords(version) - (eccPerBlock[version] * blocks[version]);

export function alignmentPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }

  const count = Math.floor(version / 7) + 2;
  const size = (version * 4) + 17;
  const step = Math.ceil(((version * 4) + 4) / ((count * 2) - 2)) * 2;
  const result = [6];
  for (let pos = size - 7; result.length < count; pos -= step) {
    result.splice(1, 0, pos);
  }

  return result;
}

/** Multiplication in GF(2^8) modulo x^8 + x^4 + x^3 + x^2 + 1. */
function gfMultiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11D);
    z ^= ((y >>> i) & 1) * x;
  }

  return z & 0xFF;
}

export function reedSolomonDivisor(degree: number): number[] {
  const result: number[] = Array.from({length: degree}, () => 0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMultiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }

    root = gfMultiply(root, 0x02);
  }

  return result;
}

export function reedSolomonRemainder(data: number[], divisor: number[]): number[] {
  const result: number[] = divisor.map(() => 0);
  for (const value of data) {
    const factor = value ^ result.shift()!;
    result.push(0);
    for (const [index, coefficient] of divisor.entries()) {
      result[index] ^= gfMultiply(coefficient, factor);
    }
  }

  return result;
}

/** Splits the data into blocks, adds error correction to each, and interleaves them. */
function addEccAndInterleave(data: number[], version: number): number[] {
  const numBlocks = blocks[version];
  const eccLength = eccPerBlock[version];
  const raw = totalCodewords(version);
  const numShort = numBlocks - (raw % numBlocks);
  const shortLength = Math.floor(raw / numBlocks);
  const divisor = reedSolomonDivisor(eccLength);

  const parts: number[][] = [];
  for (let i = 0, k = 0; i < numBlocks; i++) {
    const chunk = data.slice(k, k + shortLength - eccLength + (i < numShort ? 0 : 1));
    k += chunk.length;
    const ecc = reedSolomonRemainder(chunk, divisor);
    if (i < numShort) {
      chunk.push(0);
    }

    parts.push([...chunk, ...ecc]);
  }

  const result: number[] = [];
  for (let i = 0; i < parts[0].length; i++) {
    for (const [j, part] of parts.entries()) {
      if (i !== shortLength - eccLength || j >= numShort) {
        result.push(part[i]);
      }
    }
  }

  return result;
}

/** Mode indicator, length, data, terminator and padding for byte mode. */
function encodeData(bytes: Uint8Array, version: number): number[] {
  const bits: number[] = [];
  const append = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) {
      bits.push((value >>> i) & 1);
    }
  };

  append(0b0100, 4);
  append(bytes.length, version < 10 ? 8 : 16);
  for (const value of bytes) {
    append(value, 8);
  }

  const capacity = dataCodewords(version) * 8;
  append(0, Math.min(4, capacity - bits.length));
  append(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xEC; bits.length < capacity; pad ^= 0xEC ^ 0x11) {
    append(pad, 8);
  }

  const result: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    result.push(bits.slice(i, i + 8).reduce((byte, value) => (byte << 1) | value, 0));
  }

  return result;
}

/** The 15 format bits (level M, mask) with their BCH code and mask pattern. */
export function formatBits(mask: number): number {
  const data = (formatBitsM << 3) | mask;
  let remainder = data;
  for (let i = 0; i < 10; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537);
  }

  return ((data << 10) | remainder) ^ 0x5412;
}

/** The 18 version bits for version 7 and up. */
export function versionBits(version: number): number {
  let remainder = version;
  for (let i = 0; i < 12; i++) {
    remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1F25);
  }

  return (version << 12) | remainder;
}

const masks: Array<(x: number, y: number) => boolean> = [
  (x, y) => (x + y) % 2 === 0,
  (_x, y) => y % 2 === 0,
  x => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

class Matrix {
  readonly modules: boolean[][];
  readonly isFunction: boolean[][];

  constructor(readonly size: number) {
    this.modules = Array.from({length: size}, () => Array.from({length: size}, () => false));
    this.isFunction = Array.from({length: size}, () => Array.from({length: size}, () => false));
  }

  setFunction(x: number, y: number, dark: boolean) {
    this.modules[y][x] = dark;
    this.isFunction[y][x] = true;
  }

  drawFunctionPatterns(version: number) {
    const {size} = this;
    for (let i = 0; i < size; i++) {
      this.setFunction(6, i, i % 2 === 0);
      this.setFunction(i, 6, i % 2 === 0);
    }

    for (const [x, y] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const distance = Math.max(Math.abs(dx), Math.abs(dy));
          const xx = x + dx;
          const yy = y + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) {
            this.setFunction(xx, yy, distance !== 2 && distance !== 4);
          }
        }
      }
    }

    const positions = alignmentPositions(version);
    const last = positions.length - 1;
    for (const [i, x] of positions.entries()) {
      for (const [j, y] of positions.entries()) {
        // Not on top of the three finder patterns
        if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) {
          continue;
        }

        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            this.setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      }
    }

    this.drawFormat(0); // Reserves the area; drawn again once the mask is known
    if (version >= 7) {
      const bits = versionBits(version);
      for (let i = 0; i < 18; i++) {
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        this.setFunction(a, b, bit(bits, i));
        this.setFunction(b, a, bit(bits, i));
      }
    }
  }

  drawFormat(mask: number) {
    const {size} = this;
    const bits = formatBits(mask);
    for (let i = 0; i <= 5; i++) {
      this.setFunction(8, i, bit(bits, i));
    }

    this.setFunction(8, 7, bit(bits, 6));
    this.setFunction(8, 8, bit(bits, 7));
    this.setFunction(7, 8, bit(bits, 8));
    for (let i = 9; i < 15; i++) {
      this.setFunction(14 - i, 8, bit(bits, i));
    }

    for (let i = 0; i < 8; i++) {
      this.setFunction(size - 1 - i, 8, bit(bits, i));
    }

    for (let i = 8; i < 15; i++) {
      this.setFunction(8, size - 15 + i, bit(bits, i));
    }

    this.setFunction(8, size - 8, true); // The dark module
  }

  drawCodewords(data: number[]) {
    const {size} = this;
    let i = 0;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) {
        right = 5; // Skip the vertical timing pattern
      }

      for (let vertical = 0; vertical < size; vertical++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          const y = upward ? size - 1 - vertical : vertical;
          if (!this.isFunction[y][x] && i < data.length * 8) {
            this.modules[y][x] = bit(data[i >>> 3], 7 - (i & 7));
            i++;
          }
        }
      }
    }
  }

  applyMask(mask: number) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!this.isFunction[y][x] && masks[mask](x, y)) {
          this.modules[y][x] = !this.modules[y][x];
        }
      }
    }
  }

  /** The penalty score of the standard (rules N1 to N4): lower scans more reliably. */
  penalty(): number {
    const {size, modules} = this;
    let result = 0;
    const lines = [
      ...modules,
      ...Array.from({length: size}, (_, x) => modules.map(row => row[x])),
    ];
    const finderLike = [[true, false, true, true, true, false, true, false, false, false, false], [false, false, false, false, true, false, true, true, true, false, true]];

    for (const line of lines) {
      let run = 1;
      for (let i = 1; i <= size; i++) {
        if (i < size && line[i] === line[i - 1]) {
          run++;
        } else {
          if (run >= 5) {
            result += 3 + (run - 5);
          }

          run = 1;
        }
      }

      for (let i = 0; i + 11 <= size; i++) {
        if (finderLike.some(pattern => pattern.every((value, k) => line[i + k] === value))) {
          result += 40;
        }
      }
    }

    for (let y = 0; y + 1 < size; y++) {
      for (let x = 0; x + 1 < size; x++) {
        const color = modules[y][x];
        if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) {
          result += 3;
        }
      }
    }

    const dark = modules.reduce((total, row) => total + row.filter(Boolean).length, 0);
    const total = size * size;
    result += (Math.ceil(Math.abs((dark * 20) - (total * 10)) / total) - 1) * 10;
    return result;
  }
}

/** The modules of a QR code for `text` (true = dark), without the quiet zone. */
export function encodeQr(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  let version = 1;
  while (version <= maxVersion && 4 + (version < 10 ? 8 : 16) + (bytes.length * 8) > dataCodewords(version) * 8) {
    version++;
  }

  if (version > maxVersion) {
    throw new RangeError('Te veel tekst voor een QR-code');
  }

  const codewords = addEccAndInterleave(encodeData(bytes, version), version);
  let best: {penalty: number; modules: boolean[][]} | undefined;
  for (let mask = 0; mask < 8; mask++) {
    const matrix = new Matrix((version * 4) + 17);
    matrix.drawFunctionPatterns(version);
    matrix.drawCodewords(codewords);
    matrix.applyMask(mask);
    matrix.drawFormat(mask);
    const penalty = matrix.penalty();
    if (!best || penalty < best.penalty) {
      best = {penalty, modules: matrix.modules};
    }
  }

  return best!.modules;
}
