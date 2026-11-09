import type {Metadata} from 'next';
import {SpeechBubble} from '@components/ui';
import {CtaButton} from '@components/ui/cta-button';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {PageIntro, contourTitle} from '@components/layout/contour-parts';
import {TeamCards} from '@features/team/team-cards';
import {content, type FaqItem} from '@lib/content';
import {generateMetadata as generateSeoMetadata, JsonLd} from '@lib/seo';

export function generateMetadata(): Metadata {
  const pagina = content.getPagina('over-ons');
  return generateSeoMetadata({title: pagina.titel, description: pagina.beschrijving, url: '/over-ons'});
}

const stripTags = (html: string) => html.replaceAll(/<[^>]*>/g, '').replaceAll(/\s+/g, ' ').trim();

/** FAQPage structured data, so the questions can show up in search results. */
function faqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.vraag,
      acceptedAnswer: {'@type': 'Answer', text: stripTags(item.html)},
    })),
  };
}

export default function Page() {
  const pagina = content.getPagina('over-ons');
  const team = content.getTeam();
  const bestuur = team.filter(lid => lid.categorie === 'bestuur');
  const leden = team.filter(lid => lid.categorie === 'lid');
  const faq = content.getFaq();

  return (
    <PageWithAnnouncements>
      {faq.length > 0 && <JsonLd data={faqSchema(faq)} />}
      <PageIntro titel={pagina.hero.titel} intro={pagina.hero.ondertitel}>
        <div
          className='flex-[1_1_460px] min-w-0 font-display font-bold text-gray-900 text-[clamp(24px,2.4vw,32px)] leading-[1.3] tracking-[-0.01em] [&_p+p]:mt-4'
          dangerouslySetInnerHTML={{__html: pagina.html}}
        />
      </PageIntro>

      {bestuur.length > 0 && (
        <section className='bg-gray-50 border-y-(length:--contour-width-sm) border-ink px-5 py-[clamp(56px,6vw,88px)]'>
          <div className='max-w-[1240px] mx-auto flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
              <h2 className={contourTitle}>{pagina.bestuur.titel}</h2>
              <p className='text-[17px] text-gray-700'>{pagina.bestuur.tekst}</p>
            </div>
            <TeamCards leden={bestuur} />
          </div>
        </section>
      )}

      {leden.length > 0 && (
        <section className='px-5 py-[clamp(56px,6vw,88px)]'>
          <div className='max-w-[1240px] mx-auto flex flex-col gap-8'>
            <div className='flex flex-col gap-2'>
              <h2 className={contourTitle}>{pagina.leden.titel}</h2>
              <p className='text-[17px] text-gray-700'>{pagina.leden.tekst}</p>
            </div>
            <TeamCards leden={leden} layout='kolommen' />
          </div>
        </section>
      )}

      <section className='px-5 pb-[clamp(56px,6vw,88px)]'>
        <div className='max-w-[1240px] mx-auto flex flex-wrap items-center gap-10'>
          {faq.length > 0 && (
            <div className='flex-[1_1_520px] min-w-0 flex flex-col gap-12 pb-8'>
              <h2 className='sr-only'>{pagina.faqTitel}</h2>
              {faq.map(item => (
                <SpeechBubble key={item.slug} tail='bottom' tone='green' size='md'>
                  <h3 className='mb-3.5 font-display font-extrabold text-black text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-[-0.02em]'>{item.vraag}</h3>
                  <div className='text-[17px] leading-relaxed text-black' dangerouslySetInnerHTML={{__html: item.html}} />
                </SpeechBubble>
              ))}
            </div>
          )}
          {pagina.cta && (
            <div className='flex-[1_1_320px] min-w-0 flex flex-col items-start gap-4'>
              <p className='text-lg leading-relaxed text-gray-700'>{pagina.cta.tekst}</p>
              <div className='flex flex-wrap gap-3.5'>
                {pagina.cta.knoppen.map((knop, index) => (
                  <CtaButton
                    key={knop.link}
                    text={knop.tekst}
                    href={knop.link}
                    variant={index === 0 ? 'contour' : 'contour-outline'}
                    showArrow={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageWithAnnouncements>
  );
}
