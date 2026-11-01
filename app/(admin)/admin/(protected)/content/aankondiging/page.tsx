import type {Metadata} from 'next';
import Link from 'next/link';
import {CORE_SCHEMA, load} from 'js-yaml';
import {requireEditorSession} from '@lib/auth/require-admin';
import {ContentStoreError} from '@lib/content-store/errors';
import {isEditingConfigured, readFile} from '@lib/content-store/github';
import {AnnouncementForm, type AnnouncementInitial} from '@features/admin/content-editor/announcement-form';
import {NotConfigured} from '@features/admin/content-editor/not-configured';

export const metadata: Metadata = {title: 'Aankondiging'};
export const dynamic = 'force-dynamic';

const asText = (value: unknown) => (typeof value === 'string' ? value : '');

export default async function AnnouncementPage() {
  await requireEditorSession();

  const header = (
    <div>
      <p className='text-sm'><Link href='/admin/content' className='text-primary-text hover:underline'>Content</Link></p>
      <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>Aankondiging</h1>
    </div>
  );

  if (!isEditingConfigured()) {
    return <div className='space-y-6'>{header}<NotConfigured /></div>;
  }

  let file: Awaited<ReturnType<typeof readFile>>;
  let problem: string | undefined;
  try {
    file = await readFile('content/site.yaml');
  } catch (error) {
    problem = error instanceof ContentStoreError ? error.message : 'De aankondiging kan nu niet geladen worden.';
  }

  if (!file) {
    return (
      <div className='space-y-6'>
        {header}
        <p role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-red-600'>
          {problem ?? 'De site-instellingen zijn niet gevonden.'}
        </p>
      </div>
    );
  }

  let current: Record<string, unknown> = {};
  try {
    const site = load(file.text, {schema: CORE_SCHEMA}) as {aankondiging?: Record<string, unknown>} | undefined;
    current = site?.aankondiging ?? {};
  } catch {
    return (
      <div className='space-y-6'>
        {header}
        <p role='alert' className='rounded-button border border-red-200 bg-red-50 p-3 text-red-600'>
          De site-instellingen kunnen niet gelezen worden. Vraag de beheerder om hulp.
        </p>
      </div>
    );
  }

  const initial: AnnouncementInitial = {
    actief: current.actief === true,
    tekst: asText(current.tekst),
    type: asText(current.type) === '' ? 'info' : asText(current.type),
    link: asText(current.link),
    linkTekst: asText(current.linkTekst),
  };

  return (
    <div className='space-y-6 max-w-3xl'>
      {header}
      <AnnouncementForm initial={initial} sha={file.sha} />
    </div>
  );
}
