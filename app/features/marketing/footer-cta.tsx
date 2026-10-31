import {content} from '@lib/content';
import {CtaBanner} from '@features/marketing/cta-banner';
import {CtaButton} from '@components/ui/cta-button';

type FooterCtaProperties = {
  titel: string;
  tekst: string;
  knop: {tekst: string; link: string};
};

export function FooterCta({titel, tekst, knop}: Readonly<FooterCtaProperties>) {
  return (
    <CtaBanner>
      <h2 className='text-3xl font-bold text-white mb-4'>{titel}</h2>
      <p className='text-lg text-white/90 mb-8'>{tekst}</p>
      <CtaButton text={knop.tekst} href={knop.link} />
    </CtaBanner>
  );
}

/**
 * Sitewide call to action, read from content/site.yaml.
 */
export async function FooterCtaServer() {
  const {cta} = await content.getSite();

  return <FooterCta titel={cta.titel} tekst={cta.tekst} knop={cta.knop} />;
}
