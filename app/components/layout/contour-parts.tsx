import type {ReactNode} from 'react';
import {CtaButton} from '@components/ui/cta-button';

/** Section title in the contour style; also used by the homepage. */
export const contourTitle = 'font-display font-extrabold text-black text-[clamp(32px,3.2vw,44px)] tracking-[-0.02em]';

/** The three logo colors as a short stripe above a heading. */
export function LogoStripe() {
  return (
    <div aria-hidden='true' className='flex gap-1.5'>
      <span className='w-10 h-1.5 rounded-full bg-logo-pink' />
      <span className='w-10 h-1.5 rounded-full bg-logo-green' />
      <span className='w-10 h-1.5 rounded-full bg-logo-orange' />
    </div>
  );
}

/** Opening of a page in the contour style: stripe, title and intro, with optional content on the right (filters, a quote). */
export function PageIntro({titel, intro, children}: Readonly<{titel: string; intro?: string; children?: ReactNode}>) {
  return (
    <section className='px-5 pt-[clamp(48px,6vw,80px)] pb-[clamp(32px,4vw,48px)]'>
      <div className='max-w-[1240px] mx-auto flex flex-wrap items-end justify-between gap-x-[clamp(32px,5vw,72px)] gap-y-8'>
        <div className='flex-[1_1_460px] min-w-0 flex flex-col gap-4'>
          <LogoStripe />
          <h1 className='font-display font-extrabold text-black text-[clamp(44px,5vw,66px)] leading-[0.98] tracking-[-0.02em]'>{titel}</h1>
          {intro && <p className='max-w-[560px] text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

type Cta = {titel: string; tekst: string; knoppen: Array<{tekst: string; link: string}>};

/** Closing call to action on a pink contour panel. */
export function ContourCta({cta}: Readonly<{cta?: Cta}>) {
  if (!cta) {
    return null;
  }

  return (
    <section className='px-3 sm:px-[clamp(12px,2vw,24px)] pb-[clamp(56px,6vw,80px)]'>
      <div className='max-w-[1240px] mx-auto bg-primary rounded-panel contour shadow-hard-lg px-[clamp(24px,4vw,56px)] py-[clamp(32px,5vw,64px)] flex flex-wrap justify-between items-center gap-7'>
        <div className='flex-[1_1_440px] min-w-0 flex flex-col gap-3'>
          <h2 className='font-display font-extrabold text-white text-[clamp(28px,3.6vw,50px)] leading-[1.02] tracking-[-0.02em]'>{cta.titel}</h2>
          <p className='text-lg leading-normal text-white'>{cta.tekst}</p>
        </div>
        <div className='flex flex-wrap gap-3.5'>
          {cta.knoppen.map((knop, index) => (
            <CtaButton
              key={knop.link}
              text={knop.tekst}
              href={knop.link}
              variant={index === 0 ? 'contour-white' : 'contour-on-color'}
              showArrow={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
