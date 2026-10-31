import type {Metadata} from 'next';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageHero, SectionHeading} from '@components/layout/page-parts';
import {ContactForm} from '@features/contact/contact-form';
import {InfoCard} from '@features/info/info-card';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('contact');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/contact'});
}

export default function Page() {
  const pagina = content.getPagina('contact');

  return (
    <PageWithAnnouncements>
      <PageHero size='small' titel={pagina.hero.titel} ondertitel={pagina.hero.ondertitel} />
      <div className='py-12 max-w-[800px] mx-auto px-6'>
        <SectionHeading titel={pagina.formulier.titel} tekst={pagina.formulier.tekst} align='left' />
        <ContactForm showPhone={false} showSubject />
      </div>
      <InfoCard icon='email' variant='default' title={pagina.infokaart.titel} html={pagina.html} />
    </PageWithAnnouncements>
  );
}
