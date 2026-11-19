'use server';

import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createAuditContext, logAudit} from '@lib/audit';
import {requireEditorSession} from '@lib/auth/require-admin';
import {slugify} from '@lib/content/slugify';
import {commitMessage} from '@lib/content-store/commit-message';
import {ConflictError, ContentStoreError} from '@lib/content-store/errors';
import {entryPaths, listEntries, summarize} from '@lib/content-store/entries';
import {entryTypes, isEntryType, type EntryType} from '@lib/content-store/entry-types';
import {readFile} from '@lib/content-store/github';
import {ImageError, processImage} from '@lib/content-store/images';
import {maxVideoBytes, processVideo, VideoError} from '@lib/content-store/videos';
import {
  parseAnnouncementForm, parseEntryForm, serializeEntry, updateAnnouncement,
} from '@lib/content-store/serialize';
import {commitChanges, pathsUnder, type Change} from '@lib/content-store/store';
import {fotoBestand, maxFotos} from '@lib/content/schemas';

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

type EditorSession = Awaited<ReturnType<typeof requireEditorSession>>;

type GalleryFile = {file: string; sha: string};

/** The gallery photos the edit form was loaded with (`_fotos`), ignoring anything that is not a gallery file. */
function knownGallery(data: FormData): GalleryFile[] {
  try {
    const parsed: unknown = JSON.parse(text(data, '_fotos') || '[]');
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is GalleryFile => typeof item?.file === 'string' && typeof item?.sha === 'string' && fotoBestand.test(item.file));
  } catch {
    return [];
  }
}

type GalleryPlan = {kept: string[]; added: Array<{file: string; upload: File; expectedSha: string | null}>; removed: GalleryFile[]};

/**
 * Which gallery photos stay, which new ones get which file name and which files go.
 * New photos take names nobody uses first; a removed name is reused (overwritten) only when needed,
 * so one commit never deletes and creates the same path.
 */
function planGallery(existing: GalleryFile[], keepList: string[], uploads: File[]): GalleryPlan {
  const kept = keepList.filter((file, index) => existing.some(item => item.file === file) && keepList.indexOf(file) === index);
  const removed = existing.filter(item => !kept.includes(item.file));
  const all = Array.from({length: maxFotos}, (_, index) => `foto-${index + 1}.jpg`);
  const unused = all.filter(file => !existing.some(item => item.file === file));
  const reusable = removed.map(item => item.file);
  const candidates = [...unused, ...reusable.sort((a, b) => all.indexOf(a) - all.indexOf(b))];
  const added = uploads.map((upload, index) => {
    const file = candidates[index];
    return {file, upload, expectedSha: removed.find(item => item.file === file)?.sha ?? null};
  });
  return {kept, added, removed: removed.filter(item => !added.some(add => add.file === item.file))};
}

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

  let gallery: GalleryPlan | undefined;
  const galleryField = config.galleryField;
  if (galleryField) {
    const uploads = data.getAll(`${galleryField}Nieuw`).filter((item): item is File => item instanceof File && item.size > 0);
    if (uploads.some(item => item.size > maxImageBytes)) {
      return {errors: {[galleryField]: 'Een van de foto\'s is groter dan 10 MB.'}};
    }

    const existing = mode === 'edit' ? knownGallery(data) : [];
    const keepList = text(data, `${galleryField}Behouden`).split('\n').map(item => item.trim()).filter(Boolean);
    const kept = keepList.filter(file => existing.some(item => item.file === file));
    if (kept.length + uploads.length > maxFotos) {
      return {errors: {[galleryField]: `Hoogstens ${maxFotos} foto's. Verwijder er eerst een paar.`}};
    }

    gallery = planGallery(existing, keepList, uploads);
    values[galleryField] = [...gallery.kept, ...gallery.added.map(item => item.file)].map(file => `./${file}`).join('\n');
  }

  let videoUpload: File | undefined;
  const videoField = config.videoField;
  if (videoField) {
    const candidate = data.get(videoField);
    if (candidate instanceof File && candidate.size > 0) {
      if (candidate.size > maxVideoBytes) {
        return {errors: {[videoField]: 'Het filmpje is groter dan 25 MB.'}};
      }

      videoUpload = candidate;
    }

    const keepVideo = mode === 'edit' && text(data, '_videoSha') !== '' && text(data, 'verwijderVideo') === '';
    values[videoField] = videoUpload !== undefined || keepVideo ? './video.mp4' : undefined;
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

    const galleryImages: Array<{file: string; data: Buffer; expectedSha: string | null}> = [];
    if (gallery && config.galleryField) {
      for (const item of gallery.added) {
        try {
          galleryImages.push({file: item.file, data: (await processImage(Buffer.from(await item.upload.arrayBuffer()))).data, expectedSha: item.expectedSha});
        } catch (error) {
          if (error instanceof ImageError) {
            return {errors: {[config.galleryField]: `${item.upload.name}: ${error.message}`}};
          }

          throw error;
        }
      }
    }

    let video: Buffer | undefined;
    if (videoUpload && config.videoField) {
      try {
        video = processVideo(Buffer.from(await videoUpload.arrayBuffer()));
      } catch (error) {
        if (error instanceof VideoError) {
          return {errors: {[config.videoField]: error.message}};
        }

        throw error;
      }
    }

    const titleKey = config.fields[0].name;
    let slug: string;
    if (mode === 'create') {
      slug = slugify(parsed.slugSource);
      if (slug === '' || reservedSlugs.has(slug) || await slugIsTaken(type, slug)) {
        const message = slug === '' ? 'Vul een titel in.' : (reservedSlugs.has(slug) ? 'Deze titel kan niet. Kies een andere.' : duplicateMessage);
        return {errors: {[titleKey]: message}};
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

    if (config.videoField) {
      const videoPath = `${paths.dir}/video.mp4`;
      const videoSha = isCreate ? '' : text(data, '_videoSha');
      if (video) {
        changes.push({path: videoPath, content: video, expectedSha: videoSha === '' ? null : videoSha});
      } else if (videoSha !== '' && values[config.videoField] === undefined) {
        changes.push({path: videoPath, delete: true, expectedSha: videoSha});
      }
    }

    for (const item of galleryImages) {
      changes.push({path: `${paths.dir}/${item.file}`, content: item.data, expectedSha: isCreate ? null : item.expectedSha});
    }

    if (!isCreate) {
      for (const item of gallery?.removed ?? []) {
        changes.push({path: `${paths.dir}/${item.file}`, delete: true, expectedSha: item.sha});
      }
    }

    const title = String(parsed.slugSource);
    const {commitSha} = await commitChanges({
      message: commitMessage(isCreate ? 'toevoegen' : 'bijwerken', type, title),
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

    for (const item of knownGallery(data)) {
      known[`${paths.dir}/${item.file}`] = item.sha;
    }

    if (text(data, '_videoSha') !== '') {
      known[`${paths.dir}/video.mp4`] = text(data, '_videoSha');
    }

    const changes: Change[] = files.map(path => ({
      path,
      delete: true as const,
      ...(path in known ? {expectedSha: known[path]} : {}),
    }));
    const {commitSha} = await commitChanges({
      message: commitMessage('verwijderen', type, title === '' ? slug : title),
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
      message: commitMessage('bijwerken', 'aankondiging', parsed.aankondiging.tekst || 'zonder tekst'),
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
