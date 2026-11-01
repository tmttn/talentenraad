import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireEditorSession} from '@lib/auth/require-admin';
import {ContentStoreError} from '@lib/content-store/errors';
import {loadEntry} from '@lib/content-store/entries';
import {entryTypes, isEntryType} from '@lib/content-store/entry-types';
import {isEditingConfigured} from '@lib/content-store/github';
import {DeleteEntry} from '@features/admin/content-editor/delete-entry';
import {EntryForm} from '@features/admin/content-editor/entry-form';
import {NotConfigured} from '@features/admin/content-editor/not-configured';

export const metadata: Metadata = {title: 'Bewerken'};
export const dynamic = 'force-dynamic';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function EditEntryPage({params}: Readonly<{params: Promise<{type: string; slug: string}>}>) {
  await requireEditorSession();
  const {type, slug} = await params;
  if (!isEntryType(type) || !slugPattern.test(slug)) {
    notFound();
  }

  const config = entryTypes[type];
  const header = (
    <div>
      <p className='text-sm'><Link href={`/admin/content/${type}`} className='text-primary-text hover:underline'>{config.label}</Link></p>
      <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Bewerken</h1>
    </div>
  );

  if (!isEditingConfigured()) {
    return <div className='space-y-6'>{header}<NotConfigured /></div>;
  }

  let entry: Awaited<ReturnType<typeof loadEntry>>;
  try {
    entry = await loadEntry(type, slug);
  } catch (error) {
    const message = error instanceof ContentStoreError ? error.message : 'Dit item kan nu niet geladen worden.';
    return <div className='space-y-6'>{header}<p role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-red-600'>{message}</p></div>;
  }

  if (!entry) {
    notFound();
  }

  const title = entry.values[config.fields[0].name] || slug;
  const imageUrl = entry.imageSha ? `/api/admin/content/image?type=${type}&slug=${slug}&v=${entry.imageSha}` : undefined;

  return (
    <div className='space-y-6 max-w-5xl'>
      {header}
      <EntryForm type={type} mode='edit' slug={slug} initial={entry} imageUrl={imageUrl} />
      <DeleteEntry type={type} slug={slug} title={title} indexSha={entry.indexSha} imageSha={entry.imageSha} />
    </div>
  );
}
