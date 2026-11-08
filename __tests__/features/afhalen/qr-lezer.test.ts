import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

const jsQR = vi.fn();
vi.mock('jsqr', () => ({default: jsQR}));

const {maakQrLezer} = await import('../../../app/features/afhalen/qr-lezer');

const video = {videoWidth: 1280, videoHeight: 720} as HTMLVideoElement;
const context = {
  drawImage: vi.fn(),
  getImageData: vi.fn((_x: number, _y: number, width: number, height: number) => ({data: new Uint8ClampedArray(width * height * 4), width, height})),
};

beforeEach(() => {
  jsQR.mockReset();
  context.drawImage.mockClear();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('maakQrLezer', () => {
  it('falls back to jsQR without BarcodeDetector (iPhone), on a frame scaled down to 640 px', async () => {
    vi.stubGlobal('BarcodeDetector', undefined);
    jsQR.mockReturnValue({data: 'https://talentenraad.be/b/abc'});

    const lees = await maakQrLezer();

    await expect(lees(video)).resolves.toBe('https://talentenraad.be/b/abc');
    expect(context.drawImage).toHaveBeenCalledWith(video, 0, 0, 640, 360);
    expect(jsQR).toHaveBeenCalledWith(expect.any(Uint8ClampedArray), 640, 360, {inversionAttempts: 'dontInvert'});
  });

  it('reads nothing from a frame without a code, or before the camera gives an image', async () => {
    vi.stubGlobal('BarcodeDetector', undefined);
    jsQR.mockReturnValue(null);
    const lees = await maakQrLezer();

    await expect(lees(video)).resolves.toBeUndefined();
    await expect(lees({videoWidth: 0, videoHeight: 0} as HTMLVideoElement)).resolves.toBeUndefined();
  });

  it('uses BarcodeDetector where the browser has it for QR codes', async () => {
    const detect = vi.fn().mockResolvedValue([{rawValue: 'https://talentenraad.be/b/xyz'}]);
    const Detector = vi.fn(function () {
      return {detect};
    });
    Object.assign(Detector, {getSupportedFormats: vi.fn().mockResolvedValue(['ean_13', 'qr_code'])});
    vi.stubGlobal('BarcodeDetector', Detector);

    const lees = await maakQrLezer();

    await expect(lees(video)).resolves.toBe('https://talentenraad.be/b/xyz');
    expect(Detector).toHaveBeenCalledWith({formats: ['qr_code']});
    expect(jsQR).not.toHaveBeenCalled();
  });

  it('falls back to jsQR when BarcodeDetector cannot read QR codes', async () => {
    const Detector = vi.fn();
    Object.assign(Detector, {getSupportedFormats: vi.fn().mockResolvedValue(['ean_13'])});
    vi.stubGlobal('BarcodeDetector', Detector);
    jsQR.mockReturnValue({data: 'tekst'});

    const lees = await maakQrLezer();

    await expect(lees(video)).resolves.toBe('tekst');
    expect(Detector).not.toHaveBeenCalled();
  });
});
