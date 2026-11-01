import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireEditorSession} from '@lib/auth/require-admin';
import {entryTypes, isEntryType} from '@lib/content-store/entry-types';
import {isEditingConfigured} from '@lib/content-store/github';
import {EntryForm} from '@features/admin/content-editor/entry-form';
import {NotConfigured} from '@features/admin/content-editor/not-configured';

export const metadata: Metadata = {title: 'Toevoegen'};
export const dynamic = 'force-dynamic';

export default async function NewEntryPage({params}: Readonly<{params: Promise<{type: string}>}>) {
  await requireEditorSession();
  const {type} = await params;
  if (!isEntryType(type)) {
    notFound();
  }

  const config = entryTypes[type];

  return (
    <div className='space-y-6 max-w-5xl'>
      <div>
        <p className='text-sm'><Link href={`/admin/content/${type}`} className='text-primary-text hover:underline'>{config.label}</Link></p>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{config.addLabel}</h1>
      </div>
      {isEditingConfigured() ? <EntryForm type={type} mode='create' /> : <NotConfigured />}
    </div>
  );
}
