'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {requireEditorSession} from '@lib/auth/require-admin';
import {slugify} from '@lib/content/slugify';
import {ConflictError, ContentStoreError} from '@lib/content-store/errors';
import {entryPaths, listEntries, summarize} from '@lib/content-store/entries';
import {entryTypes, isEntryType, type EntryType} from '@lib/content-store/entry-types';
import {readFile} from '@lib/content-store/github';
import {ImageError, processImage} from '@lib/content-store/images';
import {
  parseAnnouncementForm, parseEntryForm, serializeEntry, updateAnnouncement,
} from '@lib/content-store/serialize';
import {commitChanges, pathsUnder, type Change} from '@lib/content-store/store';

export type FormState = {message?: string; errors?: Record<string, string>};

const author = {name: 'Talentenraad-editor', email: 'noreply@talentenraad.be'};
const maxImageBytes = 10 * 1024 * 1024;
const reservedSlugs = new Set(['nieuw']);
const duplicateMessage = 'Er bestaat al een item met deze titel';
const genericMessage = 'Er ging iets mis bij het opslaan. Probeer het later opnieuw.';

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value : '';
};

const oneLine = (value: string, max = 100) => value.replaceAll(/\s+/g, ' ').replaceAll('"', '\'').trim().slice(0, max);

type EditorSession = Awaited<ReturnType<typeof requireEditorSession>>;

const commitMessage = (verb: string, subject: string, title: string, session: EditorSession) =>
  `content: ${verb} ${subject} "${oneLine(title)}"\n\nBewerkt-door: ${oneLine(session.user.name ?? session.user.email ?? 'onbekend', 200)}`;

async function audit(
  session: EditorSession,
  actionType: 'create' | 'update' | 'delete',
  resourceType: string,
  resourceId: string,
  metadata: Record<string, unknown>,
) {
  const request = new NextRequest('http://localhost/admin/content', {method: 'POST', headers: await headers()});
  await logAudit({
    actionType, resourceType, resourceId, metadata, context: createAuditContext(request, session),
  });
}

function toState(error: unknown): FormState {
  if (error instanceof ContentStoreError) {
    return {message: error.message};
  }

  console.error('Content editor failed', error instanceof Error ? error.name : 'unknown');
  return {message: genericMessage};
}

async function slugIsTaken(type: EntryType, slug: string): Promise<boolean> {
  const items = await listEntries(type);
  return items.some(item => item.slug === slug || item.aliases.includes(slug));
}

export async function saveEntry(_previous: FormState, data: FormData): Promise<FormState> {
  const session = await requireEditorSession();
  const type = text(data, '_type');
  if (!isEntryType(type)) {
    return {message: 'Onbekend type.'};
  }

  const config = entryTypes[type];
  const mode = text(data, '_mode') === 'edit' ? 'edit' : 'create';
  const imageField = config.imageField;

  const values: Record<string, string | undefined> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === 'string') {
      values[key] = value;
    }
  }

  let upload: File | undefined;
  if (imageField) {
    const candidate = data.get(imageField);
    if (candidate instanceof File && candidate.size > 0) {
      if (candidate.size > maxImageBytes) {
        return {errors: {[imageField]: 'De foto is groter dan 10 MB.'}};
      }

      upload = candidate;
    }

    const hadImage = mode === 'edit' && text(data, '_hasImage') === '1';
    const keepImage = hadImage && text(data, 'verwijderAfbeelding') === '';
    values[imageField] = upload !== undefined || keepImage ? `./${config.imageFile}` : undefined;
  }

  // Aliases are not part of the form: keep the ones of the current file, none for a new item.
  delete values.aliassen;
  if (mode === 'edit') {
    try {
      const current = await readFile(entryPaths(type, text(data, '_slug')).index);
      if (current) {
        values.aliassen = summarize(type, text(data, '_slug'), current.text).aliases.join('\n');
      }
    } catch (error) {
      return toState(error);
    }
  }

  const parsed = parseEntryForm(type, values);
  if (!parsed.ok) {
    return {errors: parsed.errors};
  }

  let sha = '';
  try {
    let image: Buffer | undefined;
    if (upload && config.imageField) {
      try {
        image = (await processImage(Buffer.from(await upload.arrayBuffer()))).data;
      } catch (error) {
        if (error instanceof ImageError) {
          return {errors: {[config.imageField]: error.message}};
        }

        throw error;
      }
    }

    const titleKey = config.fields[0].name;
    let slug: string;
    if (mode === 'create') {
      slug = slugify(parsed.slugSource);
      if (slug === '' || reservedSlugs.has(slug) || await slugIsTaken(type, slug)) {
        return {errors: {[titleKey]: slug === '' ? 'Vul een titel in.' : duplicateMessage}};
      }
    } else {
      slug = text(data, '_slug');
    }

    const paths = entryPaths(type, slug);
    const isCreate = mode === 'create';
    const changes: Change[] = [{
      path: paths.index,
      content: serializeEntry(type, parsed.frontmatter, parsed.body),
      expectedSha: isCreate ? null : text(data, '_indexSha'),
    }];
    if (paths.image) {
      const imageSha = text(data, '_imageSha');
      if (image) {
        changes.push({path: paths.image, content: image, expectedSha: isCreate ? null : (imageSha === '' ? null : imageSha)});
      } else if (!isCreate && imageSha !== '' && values[config.imageField as string] === undefined) {
        changes.push({path: paths.image, delete: true, expectedSha: imageSha});
      }
    }

    const title = String(parsed.slugSource);
    const {commitSha} = await commitChanges({
      message: commitMessage(isCreate ? 'toevoegen' : 'bijwerken', type, title, session),
      author,
      changes,
    });
    await audit(session, isCreate ? 'create' : 'update', `content:${type}`, slug, {commitSha, title});
    sha = commitSha;
  } catch (error) {
    return toState(error);
  }

  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}?opgeslagen=1&commit=${sha}`);
}

export async function deleteEntry(_previous: FormState, data: FormData): Promise<FormState> {
  const session = await requireEditorSession();
  const type = text(data, '_type');
  if (!isEntryType(type)) {
    return {message: 'Onbekend type.'};
  }

  const slug = text(data, '_slug');
  const title = text(data, '_title');
  let sha = '';
  try {
    const paths = entryPaths(type, slug);
    const existing = await pathsUnder(paths.dir);
    const files = entryTypes[type].singleFile
      ? existing.filter(path => path === paths.index)
      : existing.filter(path => path.startsWith(`${paths.dir}/`));
    if (!files.includes(paths.index)) {
      return {message: 'Dit item bestaat niet meer. Herlaad de pagina.'};
    }

    const known: Record<string, string> = {[paths.index]: text(data, '_indexSha')};
    if (paths.image && text(data, '_imageSha') !== '') {
      known[paths.image] = text(data, '_imageSha');
    }

    const changes: Change[] = files.map(path => ({
      path,
      delete: true as const,
      ...(path in known ? {expectedSha: known[path]} : {}),
    }));
    const {commitSha} = await commitChanges({
      message: commitMessage('verwijderen', type, title === '' ? slug : title, session),
      author,
      changes,
    });
    await audit(session, 'delete', `content:${type}`, slug, {commitSha, title});
    sha = commitSha;
  } catch (error) {
    return toState(error);
  }

  revalidatePath('/admin/content');
  revalidatePath(`/admin/content/${type}`);
  redirect(`/admin/content/${type}?verwijderd=1&commit=${sha}`);
}

export async function saveAnnouncement(_previous: FormState, data: FormData): Promise<FormState> {
  const session = await requireEditorSession();
  const parsed = parseAnnouncementForm(data);
  if (!parsed.ok) {
    return {errors: parsed.errors};
  }

  let sha = '';
  try {
    const file = await readFile('content/site.yaml');
    if (!file) {
      return {message: 'De site-instellingen zijn niet gevonden.'};
    }

    if (file.sha !== text(data, '_sha')) {
      throw new ConflictError();
    }

    const {commitSha} = await commitChanges({
      message: `content: bijwerken aankondiging "${oneLine(parsed.aankondiging.tekst)}"\n\nBewerkt-door: ${oneLine(session.user.name ?? session.user.email ?? 'onbekend', 200)}`,
      author,
      changes: [{path: 'content/site.yaml', content: updateAnnouncement(file.text, parsed.aankondiging), expectedSha: file.sha}],
    });
    await audit(session, 'update', 'content:aankondiging', 'site.yaml', {commitSha});
    sha = commitSha;
  } catch (error) {
    return toState(error);
  }

  revalidatePath('/admin/content');
  redirect(`/admin/content?opgeslagen=1&commit=${sha}`);
}
