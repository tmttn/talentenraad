import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {Plus} from 'lucide-react';
import {requireEditorSession} from '@lib/auth/require-admin';
import {listEntries} from '@lib/content-store/entries';
import {entryTypes, isEntryType, savedMessage} from '@lib/content-store/entry-types';
import {isEditingConfigured, latestDeployStatus} from '@lib/content-store/github';
import {ContentStoreError} from '@lib/content-store/errors';
import {DeployStatus} from '@features/admin/content-editor/deploy-status';
import {NotConfigured} from '@features/admin/content-editor/not-configured';
import {primaryButton} from '@features/admin/content-editor/styles';

export const metadata: Metadata = {title: 'Content'};
export const dynamic = 'force-dynamic';

const formatDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('nl-BE', {day: 'numeric', month: 'long', year: 'numeric'});
};

export default async function ContentListPage({params, searchParams}: Readonly<{
  params: Promise<{type: string}>;
  searchParams: Promise<{opgeslagen?: string; verwijderd?: string; commit?: string}>;
}>) {
  await requireEditorSession();
  const {type} = await params;
  if (!isEntryType(type)) {
    notFound();
  }

  const {opgeslagen, verwijderd, commit} = await searchParams;
  const validCommit = commit && /^[0-9a-f]{40}$/.test(commit) ? commit : undefined;
  const config = entryTypes[type];
  const configured = isEditingConfigured();

  let items: Awaited<ReturnType<typeof listEntries>> = [];
  let problem: string | undefined;
  let state: Awaited<ReturnType<typeof latestDeployStatus>>['state'] = 'onbekend';
  if (configured) {
    try {
      [items, state] = await Promise.all([listEntries(type), latestDeployStatus(validCommit).then(status => status.state).catch(() => 'onbekend' as const)]);
    } catch (error) {
      problem = error instanceof ContentStoreError ? error.message : 'De lijst kan nu niet geladen worden.';
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-sm'><Link href='/admin/content' className='text-primary-text hover:underline'>Content</Link></p>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>{config.label}</h1>
        </div>
        {configured && (
          <Link href={`/admin/content/${type}/nieuw`} className={primaryButton}>
            <Plus className='w-4 h-4' aria-hidden='true' />
            {config.addLabel}
          </Link>
        )}
      </div>
      {!configured && <NotConfigured />}
      {(opgeslagen ?? verwijderd) && configured && (
        <div className='space-y-2'>
          <p role='status' className='rounded-button border border-green-200 bg-green-50 p-3 text-green-800'>
            {verwijderd ? 'Verwijderd. De wijziging staat over ongeveer 3 minuten online.' : savedMessage}
          </p>
          <DeployStatus initial={state} commit={validCommit} />
        </div>
      )}
      {problem && <p role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-red-600'>{problem}</p>}
      {configured && !problem && items.length === 0 && (
        <p className='text-gray-600'>Er staan hier nog geen items.</p>
      )}
      {items.length > 0 && (
        <ul className='divide-y divide-gray-100 bg-white rounded-card shadow-base'>
          {items.map(item => (
            <li key={item.slug} className='flex items-center justify-between gap-3 p-4'>
              <div className='min-w-0'>
                <p className='font-medium text-gray-800 truncate'>
                  {item.title}
                  {item.concept && <span className='ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'>Concept</span>}
                </p>
                {item.subtitle && (
                  <p className='text-sm text-gray-500'>{item.datum ? formatDate(item.subtitle) : item.subtitle}</p>
                )}
              </div>
              <Link
                href={`/admin/content/${type}/${item.slug}`}
                className='shrink-0 text-primary-text font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-button px-1'
              >
                Bewerken
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
