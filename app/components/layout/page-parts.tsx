import {Hero} from '@features/marketing/hero';
import {CtaBanner} from '@features/marketing/cta-banner';
import {UnifiedCta} from '@features/marketing/unified-cta';
import {CtaButton} from '@components/ui/cta-button';
import {Typography} from '@components/ui/typography';
import type {Pagina} from '@lib/content';

type Cta = NonNullable<Pagina<'home'>['cta']>;

export function PageHero({
  size,
  titel,
  ondertitel,
}: Readonly<{size: 'compact' | 'small' | 'medium'; titel: string; ondertitel: string}>) {
  return (
    <Hero size={size}>
      <Typography text={titel} variant='h1' color='white' align='center' />
      <Typography text={ondertitel} variant='lead' color='white' align='center' />
    </Hero>
  );
}

/** Centered heading with an optional muted line below, as used above lists and grids. */
export function SectionHeading({
  titel,
  tekst,
  align = 'center',
}: Readonly<{titel: string; tekst?: string; align?: 'left' | 'center'}>) {
  return (
    <>
      <Typography text={titel} variant='h2' align={align} />
      {tekst && <Typography text={tekst} variant='body' color='muted' align={align} />}
    </>
  );
}

function CtaContent({cta}: Readonly<{cta: Cta}>) {
  return (
    <>
      <Typography text={cta.titel} variant='h2' color='white' align='center' />
      <Typography text={cta.tekst} variant='body' color='white' align='center' />
      <div className='flex flex-wrap justify-center gap-4 mt-6'>
        {cta.knoppen.map((knop, index) => (
          <CtaButton
            key={knop.link}
            text={knop.tekst}
            href={knop.link}
            variant={index === 0 ? 'white' : 'outline'}
            size='md'
            showArrow
          />
        ))}
      </div>
    </>
  );
}

export function PageCtaBanner({cta}: Readonly<{cta?: Cta}>) {
  if (!cta) {
    return null;
  }

  return (
    <CtaBanner variant='accent'>
      <CtaContent cta={cta} />
    </CtaBanner>
  );
}

export function PageUnifiedCta({cta, variant}: Readonly<{cta?: Cta; variant: 'compact' | 'full'}>) {
  if (!cta) {
    return null;
  }

  return (
    <UnifiedCta variant={variant}>
      <CtaContent cta={cta} />
    </UnifiedCta>
  );
}
