/** Reads QR codes from the camera image: the browser's BarcodeDetector where it exists, jsQR elsewhere (iPhone). */

type Detector = {detect: (source: HTMLVideoElement) => Promise<Array<{rawValue: string}>>};
type DetectorConstructor = {
  new (options: {formats: string[]}): Detector;
  getSupportedFormats?: () => Promise<string[]>;
};

/** Reads one frame; undefined when there is no QR code in it. */
export type QrLezer = (video: HTMLVideoElement) => Promise<string | undefined>;

/** jsQR is slow on full camera frames: the frame is scaled down to this width first. */
const maxBreedte = 640;

async function metBarcodeDetector(): Promise<QrLezer | undefined> {
  const Native = (globalThis as unknown as {BarcodeDetector?: DetectorConstructor}).BarcodeDetector;
  if (!Native) {
    return undefined;
  }

  try {
    const formats = await Native.getSupportedFormats?.() ?? ['qr_code'];
    if (!formats.includes('qr_code')) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  const detector = new Native({formats: ['qr_code']});
  return async video => {
    const [code] = await detector.detect(video);
    return code?.rawValue;
  };
}

async function metJsQr(): Promise<QrLezer> {
  const {default: jsQR} = await import('jsqr');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', {willReadFrequently: true});
  return async video => {
    if (!context || video.videoWidth === 0) {
      return undefined;
    }

    const schaal = Math.min(1, maxBreedte / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * schaal);
    canvas.height = Math.round(video.videoHeight * schaal);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const {data, width, height} = context.getImageData(0, 0, canvas.width, canvas.height);
    // Our QR codes are dark on light: skipping the inverted pass halves the work per frame
    return jsQR(data, width, height, {inversionAttempts: 'dontInvert'})?.data;
  };
}

/** The best reader this browser has. */
export async function maakQrLezer(): Promise<QrLezer> {
  return await metBarcodeDetector() ?? metJsQr();
}
