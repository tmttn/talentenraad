import Image from 'next/image';
import type {ContentImage} from '@lib/content/files';

type Properties = {
  fotos: ContentImage[];
  /** Used in the alt text: "Foto 2 bij <titel>". */
  titel: string;
};

/**
 * The extra photos of a news item, below the text. Each tile links to the full photo,
 * so it works without JavaScript and the browser's own viewer takes care of zooming.
 */
export function FotoGalerij({fotos, titel}: Readonly<Properties>) {
  if (fotos.length === 0) {
    return null;
  }

  return (
    <section aria-label={`Foto's`} className='flex flex-col gap-4'>
      <h2 className='font-display font-extrabold text-black text-[clamp(24px,2.2vw,30px)] tracking-[-0.02em]'>Foto&apos;s</h2>
      <ul className='grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'>
        {fotos.map((foto, index) => (
          <li key={foto.src}>
            <a
              href={foto.src}
              className='block rounded-tile contour-xs overflow-hidden bg-gray-50 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus'
            >
              <Image
                src={foto.src}
                width={foto.width}
                height={foto.height}
                alt={`Foto ${index + 1} bij ${titel}`}
                sizes='(min-width: 820px) 250px, 50vw'
                className='aspect-square w-full object-cover'
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
