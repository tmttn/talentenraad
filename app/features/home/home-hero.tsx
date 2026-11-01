import {SpeechBubble} from '@components/ui';
import {CtaButton} from '@components/ui/cta-button';

type Knop = {tekst: string; link: string};

type HomeHeroProperties = {
  titel: string;
  ondertitel: string;
  knoppen: Knop[];
};

/**
 * Homepage hero: a wide panel with a speech-bubble card overlapping its bottom edge.
 * The panel shows overlapping circles in the logo colors until there is a mood photo.
 */
function HomeHero({titel, ondertitel, knoppen}: Readonly<HomeHeroProperties>) {
  return (
    <section className='px-3 sm:px-[clamp(12px,2vw,24px)]'>
      <div className='max-w-[1240px] mx-auto'>
        <div
          aria-hidden='true'
          className='relative h-[clamp(260px,40vw,560px)] rounded-[clamp(18px,2vw,28px)] bg-brand-primary-50 overflow-hidden'
        >
          <div className='absolute -left-[8%] -top-[30%] w-[45%] aspect-square rounded-full bg-logo-pink/80' />
          <div className='absolute left-[38%] -bottom-[45%] w-[38%] aspect-square rounded-full bg-logo-orange/80' />
          <div className='absolute -right-[6%] -top-[10%] w-[34%] aspect-square rounded-full bg-logo-green/80' />
        </div>
        <SpeechBubble className='-mt-[clamp(60px,9vw,150px)] mx-2 sm:mx-[clamp(8px,3vw,40px)] max-w-[660px]'>
          <div className='flex flex-col gap-[18px]'>
            <h1 className='font-display font-extrabold text-black text-[clamp(40px,5vw,66px)] leading-[0.98] tracking-[-0.02em]'>
              {titel}
            </h1>
            <p className='text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>{ondertitel}</p>
            {knoppen.length > 0 && (
              <div className='flex flex-wrap gap-3.5 pt-1'>
                {knoppen.map((knop, index) => (
                  <CtaButton
                    key={knop.link}
                    text={knop.tekst}
                    href={knop.link}
                    variant={index === 0 ? 'contour' : 'contour-outline'}
                    showArrow={index === 0}
                  />
                ))}
              </div>
            )}
          </div>
        </SpeechBubble>
      </div>
    </section>
  );
}

export {HomeHero};
