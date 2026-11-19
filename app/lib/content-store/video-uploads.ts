import {createHash, randomBytes} from 'node:crypto';
import {mkdir, readdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * A video is uploaded on its own (authenticated route, own size cap) before the form is saved,
 * so the server actions keep their small body limit. It waits here until that save, at most a day.
 */
const dir = () => path.join(process.env.VIDEO_UPLOAD_DIR ?? os.tmpdir(), 'talentenraad-video');
const maxAgeMs = 24 * 60 * 60 * 1000;
const idPattern = /^[a-f0-9]{32}$/;

const owner = (userId: string) => createHash('sha256').update(userId).digest('hex').slice(0, 16);
const fileFor = (userId: string, id: string) => path.join(dir(), `${owner(userId)}-${id}.mp4`);

async function removeOld(): Promise<void> {
  const now = Date.now();
  for (const name of await readdir(dir()).catch(() => [] as string[])) {
    const file = path.join(dir(), name);
    // eslint-disable-next-line no-await-in-loop -- a handful of files at most
    const info = await stat(file).catch(() => undefined);
    if (info && now - info.mtimeMs > maxAgeMs) {
      // eslint-disable-next-line no-await-in-loop
      await rm(file, {force: true});
    }
  }
}

/** Stores a processed video for this user and returns the id the form sends along. */
export async function saveVideoUpload(userId: string, data: Buffer): Promise<string> {
  await mkdir(dir(), {recursive: true, mode: 0o700});
  await removeOld();
  const id = randomBytes(16).toString('hex');
  await writeFile(fileFor(userId, id), data, {mode: 0o600});
  return id;
}

/** The uploaded video of this user, or undefined when the id is unknown, expired or someone else's. */
export async function readVideoUpload(userId: string, id: string): Promise<Buffer | undefined> {
  if (!idPattern.test(id)) {
    return undefined;
  }

  return readFile(fileFor(userId, id)).catch(() => undefined);
}

export async function removeVideoUpload(userId: string, id: string): Promise<void> {
  if (idPattern.test(id)) {
    await rm(fileFor(userId, id), {force: true});
  }
}
