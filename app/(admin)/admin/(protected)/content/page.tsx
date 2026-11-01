import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowRight, Megaphone} from 'lucide-react';
import {requireEditorSession} from '@lib/auth/require-admin';
import {listSlugs} from '@lib/content-store/entries';
import {entryTypeNames, entryTypes, savedMessage} from '@lib/content-store/entry-types';
import {isEditingConfigured, latestDeployStatus} from '@lib/content-store/github';
import {DeployStatus} from '@features/admin/content-editor/deploy-status';
import {NotConfigured} from '@features/admin/content-editor/not-configured';

export const metadata: Metadata = {title: 'Content'};
export const dynamic = 'force-dynamic';

async function counts() {
  return Promise.all(entryTypeNames.map(async type => {
    try {
      return {type, count: (await listSlugs(type)).length as number | undefined};
    } catch {
      return {type, count: undefined};
    }
  }));
}

async function deployState(commit?: string) {
  try {
    return (await latestDeployStatus(commit)).state;
  } catch {
    return 'onbekend' as const;
  }
}

export default async function ContentOverviewPage({searchParams}: Readonly<{searchParams: Promise<{opgeslagen?: string; commit?: string}>}>) {
  await requireEditorSession();
  const {opgeslagen, commit} = await searchParams;

  if (!isEditingConfigured()) {
    return (
      <div className='space-y-6'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Content</h1>
        <NotConfigured />
      </div>
    );
  }

  const validCommit = commit && /^[0-9a-f]{40}$/.test(commit) ? commit : undefined;
  const [items, state] = await Promise.all([counts(), deployState(validCommit)]);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Content</h1>
        <p className='text-gray-500 mt-1'>Kies wat je wilt bewerken.</p>
      </div>
      {opgeslagen && (
        <p role='status' className='rounded-button border border-green-200 bg-green-50 p-3 text-green-800'>{savedMessage}</p>
      )}
      <DeployStatus initial={state} commit={validCommit} />
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        {items.map(({type, count}) => (
          <Link
            key={type}
            href={`/admin/content/${type}`}
            className='bg-white p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          >
            <h2 className='font-semibold text-gray-800'>{entryTypes[type].label}</h2>
            <p className='text-3xl font-bold text-gray-800 mt-2'>{count ?? '–'}</p>
            <p className='text-sm text-primary-text mt-3 inline-flex items-center gap-1'>
              Bekijken <ArrowRight className='w-4 h-4' aria-hidden='true' />
            </p>
          </Link>
        ))}
        <Link
          href='/admin/content/aankondiging'
          className='bg-white p-5 rounded-card shadow-base hover:shadow-elevated transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        >
          <h2 className='font-semibold text-gray-800 flex items-center gap-2'>
            <Megaphone className='w-4 h-4 text-primary' aria-hidden='true' />
            Aankondiging
          </h2>
          <p className='text-sm text-gray-500 mt-2'>De balk bovenaan de site.</p>
          <p className='text-sm text-primary-text mt-3 inline-flex items-center gap-1'>
            Bewerken <ArrowRight className='w-4 h-4' aria-hidden='true' />
          </p>
        </Link>
      </div>
    </div>
  );
}
