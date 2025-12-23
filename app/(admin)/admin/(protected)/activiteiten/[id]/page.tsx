import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getContent} from '@lib/builder-admin';
import {EditActivityForm} from './edit-activity-form';

export const metadata: Metadata = {
  title: 'Activiteit bewerken',
};

type PageProps = {
  params: Promise<{id: string}>;
};

export default async function EditActivityPage({params}: PageProps) {
  const {id} = await params;
  const activity = await getContent('activiteit', id);

  if (!activity) {
    notFound();
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-800 mb-8'>Activiteit bewerken</h1>
      <EditActivityForm activity={activity} />
    </div>
  );
}
