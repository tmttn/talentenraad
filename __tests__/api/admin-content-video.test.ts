// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {NextRequest} from 'next/server';
import {afterAll, beforeEach, describe, expect, it, vi} from 'vitest';

const getSession = vi.fn();
vi.mock('@lib/auth/session', () => ({getSession}));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'video-route-'));
process.env.VIDEO_UPLOAD_DIR = tmp;

const route = await import('../../app/api/admin/content/video/route');
const {readVideoUpload} = await import('@lib/content-store/video-uploads');

const box = (type: string, body: Buffer) => {
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + body.length, 0);
  header.write(type, 4, 'latin1');
  return Buffer.concat([header, body]);
};

const movie = Buffer.concat([
  box('ftyp', Buffer.from('isom\0\0\0\0isom', 'latin1')),
  box('moov', box('udta', Buffer.from('+50.9500+005.4500/', 'latin1'))),
  box('mdat', Buffer.from('beeld', 'latin1')),
]);

const post = (body: BodyInit, headers: Record<string, string> = {}) => new NextRequest('http://localhost/api/admin/content/video', {
  method: 'POST', body, headers: {'content-type': 'video/mp4', ...headers},
});

const redacteur = {user: {id: 'u1', email: 'r@example.com', name: null, role: 'redacteur'}};

beforeEach(() => {
  getSession.mockReset().mockResolvedValue(redacteur);
});

afterAll(() => {
  fs.rmSync(tmp, {recursive: true, force: true});
});

describe('video upload route', () => {
  it('refuses visitors and helpers before reading the body', async () => {
    getSession.mockResolvedValue(undefined);
    expect((await route.POST(post(movie))).status).toBe(401);

    getSession.mockResolvedValue({user: {...redacteur.user, role: 'helper'}});
    expect((await route.POST(post(movie))).status).toBe(403);
  });

  it('stores the video without its location for this user only', async () => {
    const response = await route.POST(post(movie));
    const {id} = await response.json() as {id: string};

    expect(response.status).toBe(200);
    const stored = await readVideoUpload('u1', id);
    expect(stored?.toString('latin1')).not.toContain('+50.9500');
    expect(stored?.length).toBe(movie.length);
    expect(await readVideoUpload('iemand-anders', id)).toBeUndefined();
    expect(await readVideoUpload('u1', '../../etc/passwd')).toBeUndefined();
  });

  it('refuses something that is not an mp4', async () => {
    const response = await route.POST(post('dit is geen filmpje'));

    expect(response.status).toBe(400);
    expect((await response.json() as {error: string}).error).toMatch(/mp4/);
  });

  it('refuses a body over 25 MB, also when the length header lies', async () => {
    expect((await route.POST(post(movie, {'content-length': String(26 * 1024 * 1024)}))).status).toBe(413);

    const big = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(13 * 1024 * 1024));
        controller.enqueue(new Uint8Array(13 * 1024 * 1024));
        controller.close();
      },
    });
    const request = new NextRequest('http://localhost/api/admin/content/video', {method: 'POST', body: big, duplex: 'half'} as RequestInit & {duplex: 'half'});
    expect((await route.POST(request)).status).toBe(413);
  });

  it('refuses another origin', async () => {
    expect((await route.POST(post(movie, {origin: 'https://evil.example'}))).status).toBe(403);
  });
});
