import type {Metadata} from 'next';
import {Suspense} from 'react';
import {listContent} from '@lib/builder-admin';
import {CardGridSkeleton} from '@components/skeletons';
import {AankondigingenManager} from './aankondigingen-manager';

export const metadata: Metadata = {
  title: 'Aankondigingen',
};

async function AankondigingenLoader() {
  const announcements = await listContent('aankondiging');
  return <AankondigingenManager announcements={announcements} />;
}

export default function AankondigingenAdminPage() {
  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Aankondigingen</h1>
      <Suspense fallback={<CardGridSkeleton cards={4} />}>
        <AankondigingenLoader />
      </Suspense>
    </div>
  );
}
