import type {Metadata} from 'next';
import Link from 'next/link';
import {SpeechBubble} from '@components/ui';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {LogoStripe} from '@components/layout/contour-parts';
import {ContactForm} from '@features/contact/contact-form';
import {content} from '@lib/content';
import {isValidSubject} from '@lib/contact-validation';
import {generateMetadata as generateSeoMetadata} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('contact');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/contact'});
}

const bubbleTitle = 'font-display font-extrabold text-black text-2xl';

type PageProperties = {
  searchParams: Promise<{onderwerp?: string | string[]}>;
};

export default async function Page({searchParams}: Readonly<PageProperties>) {
  const pagina = content.getPagina('contact');
  // Links like /contact?onderwerp=activiteit preselect the subject; read here so the form is in the HTML
  const {onderwerp} = await searchParams;
  const defaultSubject = typeof onderwerp === 'string' && isValidSubject(onderwerp) ? onderwerp : undefined;
  const {footer} = content.getSite();

  return (
    <PageWithAnnouncements>
      <section className='px-5 pt-[clamp(48px,6vw,80px)] pb-[clamp(64px,7vw,96px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-wrap items-start gap-[clamp(40px,5vw,72px)]'>
          <div className='flex-[1_1_380px] min-w-0 flex flex-col gap-7'>
            <div className='flex flex-col gap-4'>
              <LogoStripe />
              <h1 className='font-display font-extrabold text-black text-[clamp(44px,5vw,66px)] leading-[0.98] tracking-[-0.02em]'>{pagina.hero.titel}</h1>
              <p className='text-gray-700 text-[clamp(17px,1.4vw,19px)] leading-relaxed'>{pagina.hero.ondertitel}</p>
            </div>

            <div className='flex flex-col gap-12 pb-7'>
              <SpeechBubble tone='orange' tail='bottom' size='md'>
                <div className='flex flex-col gap-2'>
                  <h2 className={bubbleTitle}>Liever mailen?</h2>
                  <a href={`mailto:${footer.email}`} className='self-start text-[17px] font-bold text-black underline underline-offset-2 break-words'>{footer.email}</a>
                </div>
              </SpeechBubble>
              <SpeechBubble tone='green' tail='bottom' size='md'>
                <div className='flex flex-col gap-2'>
                  <h2 className={bubbleTitle}>Of spreek ons aan op school</h2>
                  <p className='text-[17px] leading-normal text-black'>
                    Het Talentenhuis
                    <br />
                    {footer.adres.straat}, {footer.adres.gemeente}
                  </p>
                </div>
              </SpeechBubble>
            </div>

            <Link href='/over-ons' className='self-start font-bold text-primary-text underline underline-offset-4'>Wil je lid worden? Zo werkt het</Link>
          </div>

          <div className='flex-[2_1_520px] min-w-0'>
            <ContactForm titel={pagina.formulier.titel} defaultSubject={defaultSubject} />
          </div>
        </div>
      </section>
    </PageWithAnnouncements>
  );
}
