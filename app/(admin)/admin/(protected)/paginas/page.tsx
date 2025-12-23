import type {Metadata} from 'next';
import {Suspense} from 'react';
import Link from 'next/link';
import {listContent} from '@lib/builder-admin';
import {TableSkeleton} from '@components/skeletons';
import {PaginasTable} from './paginas-table';

export const metadata: Metadata = {
  title: 'Pagina\'s',
};

async function PaginasTableLoader() {
  const pages = await listContent('page');
  return <PaginasTable pages={pages} />;
}

export default function PaginasAdminPage() {
  return (
    <div>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Pagina&apos;s</h1>
        <Link
          href='/admin/paginas/new'
          className='px-6 py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors'
        >
          Nieuwe pagina
        </Link>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <PaginasTableLoader />
      </Suspense>
    </div>
  );
}
