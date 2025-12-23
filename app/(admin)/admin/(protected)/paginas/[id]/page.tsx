import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getContent} from '@lib/builder-admin';
import {EditPageForm} from './edit-page-form';

export const metadata: Metadata = {
  title: 'Pagina bewerken',
};

type PageProps = {
  params: Promise<{id: string}>;
};

export default async function EditPagePage({params}: PageProps) {
  const {id} = await params;
  const pageItem = await getContent('page', id);

  if (!pageItem) {
    notFound();
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Pagina bewerken</h1>
      <EditPageForm pageItem={pageItem} />
    </div>
  );
}
