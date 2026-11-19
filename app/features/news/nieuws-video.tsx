import type {ContentVideo} from '@lib/content/reader';

type Properties = {
  video: ContentVideo;
  /** The cover image, shown until the video plays. */
  poster?: string;
  titel: string;
};

/**
 * Our own mp4 below the text: the browser's own player, nothing loads before you press play
 * except the first frame's metadata. Without video support you get a download link.
 */
export function NieuwsVideo({video, poster, titel}: Readonly<Properties>) {
  return (
    <section aria-label='Filmpje' className='flex flex-col gap-4'>
      <h2 className='font-display font-extrabold text-black text-[clamp(24px,2.2vw,30px)] tracking-[-0.02em]'>Filmpje</h2>
      <div className='rounded-tile contour-sm overflow-hidden bg-black'>
        <video
          controls
          playsInline
          preload='metadata'
          poster={poster}
          aria-label={`Filmpje bij ${titel}`}
          className='block w-full max-h-[80vh]'
        >
          <source src={video.src} type='video/mp4' />
          <a href={video.src} className='block p-4 text-white underline'>Download het filmpje</a>
        </video>
      </div>
    </section>
  );
}
