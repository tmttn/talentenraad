import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PageWithAnnouncements} from '@components/layout/page-with-announcements';
import {content} from '@lib/content';
import {generateMetadata as generateSeoMetadata, generateBreadcrumbSchema, JsonLd} from '@lib/seo';

type PageProperties = {
  params: Promise<{tekst: string}>;
};

export function generateStaticParams() {
  return content.listTeksten().map(tekst => ({tekst: tekst.slug}));
}

export async function generateMetadata({params}: Readonly<PageProperties>): Promise<Metadata> {
  const {tekst: slug} = await params;
  const tekst = content.getTekst(slug);

  if (!tekst) {
    return {title: 'Pagina niet gevonden', robots: {index: false, follow: false}};
  }

  return generateSeoMetadata({title: tekst.titel, description: tekst.beschrijving, url: `/${tekst.slug}`});
}

export default async function Page({params}: Readonly<PageProperties>) {
  const {tekst: slug} = await params;
  const tekst = content.getTekst(slug);

  if (!tekst) {
    notFound();
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    {name: 'Home', url: '/'},
    {name: tekst.slug.replaceAll('-', ' ').replaceAll(/\b\w/g, char => char.toUpperCase()), url: `/${tekst.slug}`},
  ]);

  return (
    <PageWithAnnouncements>
      <JsonLd data={breadcrumbSchema} />
      <div className='max-w-[800px] mx-auto px-5 py-10'>
        <h1 className='text-[2.5rem] font-bold text-gray-800 mb-4'>{tekst.titel}</h1>
        <div
          className='prose prose-lg max-w-none prose-headings:text-gray-700 prose-p:text-gray-600'
          dangerouslySetInnerHTML={{__html: tekst.html}}
        />
      </div>
    </PageWithAnnouncements>
  );
}
