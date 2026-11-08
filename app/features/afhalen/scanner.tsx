'use client';

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Camera, CameraOff} from 'lucide-react';
import {leesTokenUitQr, momentCookie} from '@lib/bestellingen/qr-link';
import {maakQrLezer} from './qr-lezer';

type Properties = {
  actie: string;
  moment: string;
  /** The site's own address (SITE_URL); the QR links point there. */
  siteUrl: string;
};

type Toestand = 'klaar' | 'starten' | 'bezig' | 'geen-camera' | 'vreemde-code';

/** Time between two frames: fast enough to feel instant, slow enough for an old phone. */
const interval = 250;

const hoek = 'absolute w-10 h-10 border-white';

/**
 * Scans QR codes with the camera: BarcodeDetector where the browser has it, jsQR elsewhere (iPhone).
 * Only a link to /b/<token> of our own site opens the hand-over screen. Without a camera the phone's
 * own camera app works too (it opens /b/<token>, and a logged-in member lands on the hand-over
 * screen), and searching by name or code always works.
 */
export function Scanner({actie, moment, siteUrl}: Readonly<Properties>) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [toestand, setToestand] = useState<Toestand>('klaar');

  useEffect(() => {
    // Slugs and '/' are valid cookie characters: no encoding, so the server reads it as is
    document.cookie = `${momentCookie}=${actie}/${moment}; path=/; max-age=86400; samesite=lax`;
  }, [actie, moment]);

  const stop = () => {
    clearTimeout(timerRef.current);
    for (const track of streamRef.current?.getTracks() ?? []) {
      track.stop();
    }

    streamRef.current = undefined;
  };

  useEffect(() => stop, []);

  const start = async () => {
    setToestand('starten');
    let stream: MediaStream;
    try {
      // Not there over plain http (other than localhost): then the camera cannot start either
      stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}, audio: false});
    } catch {
      setToestand('geen-camera');
      return;
    }

    streamRef.current = stream;
    const video = videoRef.current!;
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      stop();
      setToestand('geen-camera');
      return;
    }

    setToestand('bezig');
    const lees = await maakQrLezer();
    const origins = [globalThis.location.origin, siteUrl];

    const scan = async () => {
      if (!streamRef.current?.active) {
        return;
      }

      try {
        const tekst = await lees(video);
        if (tekst !== undefined) {
          const token = leesTokenUitQr(tekst, origins);
          if (token) {
            stop();
            router.push(`/admin/afhalen/${actie}/${moment}/${token}`);
            return;
          }

          setToestand('vreemde-code');
        }
      } catch {
        // A frame that cannot be read: try the next one
      }

      timerRef.current = setTimeout(() => {
        void scan();
      }, interval);
    };

    void scan();
  };

  const camera = toestand === 'bezig' || toestand === 'vreemde-code';

  return (
    <div className='relative h-[360px] bg-gray-900 rounded-card overflow-hidden flex items-center justify-center'>
      <video ref={videoRef} playsInline muted aria-label='Camerabeeld' className={`absolute inset-0 w-full h-full object-cover ${camera ? '' : 'hidden'}`} />
      {camera && (
        <>
          <div aria-hidden='true' className='relative w-56 h-56'>
            <span className={`${hoek} top-0 left-0 border-t-[5px] border-l-[5px] rounded-tl-[10px]`} />
            <span className={`${hoek} top-0 right-0 border-t-[5px] border-r-[5px] rounded-tr-[10px]`} />
            <span className={`${hoek} bottom-0 left-0 border-b-[5px] border-l-[5px] rounded-bl-[10px]`} />
            <span className={`${hoek} bottom-0 right-0 border-b-[5px] border-r-[5px] rounded-br-[10px]`} />
          </div>
          <p role='status' className='absolute bottom-0 inset-x-0 px-4 py-3 text-center text-white text-[15px] font-semibold bg-gray-900/70'>
            {toestand === 'vreemde-code' ? 'Dit is geen afhaalcode van de Talentenraad.' : 'Richt op de QR-code'}
          </p>
        </>
      )}
      {(toestand === 'klaar' || toestand === 'starten') && (
        <button
          type='button'
          disabled={toestand === 'starten'}
          onClick={() => {
            void start();
          }}
          className='inline-flex items-center gap-2 px-5 py-3.5 text-lg font-bold text-white bg-primary rounded-button hover:bg-primary-hover disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900'
        >
          <Camera className='w-5 h-5' aria-hidden='true' />
          {toestand === 'starten' ? 'Camera start…' : 'Camera starten'}
        </button>
      )}
      {toestand === 'geen-camera' && (
        <div role='status' className='p-5 text-center text-white flex flex-col items-center gap-3'>
          <CameraOff className='w-7 h-7' aria-hidden='true' />
          <p>De camera kan niet starten. Geef de browser toegang tot de camera, of gebruik de camera-app van je telefoon: richt op de QR-code en tik op de link. Zoeken op naam of code kan altijd.</p>
          <button
            type='button'
            onClick={() => {
              void start();
            }}
            className='px-4 py-2.5 font-semibold text-gray-900 bg-white rounded-button hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900'
          >
            Opnieuw proberen
          </button>
        </div>
      )}
    </div>
  );
}
