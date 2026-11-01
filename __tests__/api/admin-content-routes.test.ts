// @vitest-environment node
import {NextRequest} from 'next/server';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const getSession = vi.fn();
const latestDeployStatus = vi.fn();
const listDir = vi.fn();
const api = vi.fn();

vi.mock('@lib/auth/session', () => ({getSession}));
vi.mock('@lib/content-store/github', () => ({
  latestDeployStatus, listDir, api, isEditingConfigured: () => true,
}));

const preview = await import('../../app/api/admin/content/preview/route');
const deploy = await import('../../app/api/admin/content/deploy-status/route');
const image = await import('../../app/api/admin/content/image/route');

const session = {user: {id: 'u', email: 'r@example.com', name: null, role: 'redacteur'}};
const post = (body: unknown, raw?: string) => new NextRequest('http://localhost/api/admin/content/preview', {
  method: 'POST',
  body: raw ?? JSON.stringify(body),
});

beforeEach(() => {
  getSession.mockReset().mockResolvedValue(session);
  latestDeployStatus.mockReset().mockResolvedValue({state: 'bezig'});
  listDir.mockReset();
  api.mockReset();
});

describe('preview route', () => {
  it('rejects unauthenticated requests', async () => {
    getSession.mockResolvedValue(undefined);

    expect((await preview.POST(post({markdown: 'x'}))).status).toBe(401);
  });

  it('renders markdown for a redacteur', async () => {
    const response = await preview.POST(post({markdown: '**vet**'}));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({html: '<p><strong>vet</strong></p>'});
  });

  it('strips scripts', async () => {
    const response = await preview.POST(post({markdown: '<script>alert(1)</script>hallo'}));

    expect(JSON.stringify(await response.json())).not.toContain('<script');
  });

  it('rejects oversized input', async () => {
    const response = await preview.POST(post({markdown: 'a'.repeat(60 * 1024)}));

    expect(response.status).toBe(413);
  });

  it('rejects invalid bodies', async () => {
    expect((await preview.POST(post(undefined, 'not json'))).status).toBe(400);
    expect((await preview.POST(post({markdown: 5}))).status).toBe(400);
  });
});

describe('deploy-status route', () => {
  it('is guarded', async () => {
    getSession.mockResolvedValue(undefined);

    expect((await deploy.GET()).status).toBe(401);
    expect(latestDeployStatus).not.toHaveBeenCalled();
  });

  it('returns the state', async () => {
    const response = await deploy.GET();

    expect(await response.json()).toEqual({state: 'bezig'});
  });

  it('passes a valid commit to the status lookup and rejects other values', async () => {
    const commit = 'f'.repeat(40);
    const request = (value: string) => new NextRequest(`http://localhost/api/admin/content/deploy-status?commit=${value}`);

    await deploy.GET(request(commit));
    expect(latestDeployStatus).toHaveBeenCalledWith(commit);

    latestDeployStatus.mockClear();
    expect((await deploy.GET(request('abc'))).status).toBe(400);
    expect((await deploy.GET(request('../x'))).status).toBe(400);
    expect(latestDeployStatus).not.toHaveBeenCalled();
  });

  it('falls back to onbekend when GitHub fails', async () => {
    latestDeployStatus.mockRejectedValue(new Error('boom'));

    expect(await (await deploy.GET()).json()).toEqual({state: 'onbekend'});
  });
});

describe('image route', () => {
  const get = (query: string) => new NextRequest(`http://localhost/api/admin/content/image?${query}`);

  it('is guarded', async () => {
    getSession.mockResolvedValue(undefined);

    expect((await image.GET(get('type=nieuws&slug=a'))).status).toBe(401);
  });

  it('rejects unknown types and bad slugs', async () => {
    expect((await image.GET(get('type=faq&slug=a'))).status).toBe(400);
    expect((await image.GET(get('type=nieuws&slug=..%2Fx'))).status).toBe(400);
    expect(api).not.toHaveBeenCalled();
  });

  it('streams the blob as jpeg without exposing the token', async () => {
    listDir.mockResolvedValue([{name: 'afbeelding.jpg', path: 'content/nieuws/a/afbeelding.jpg', type: 'file', sha: 'abc'}]);
    api.mockResolvedValue({status: 200, data: {content: Buffer.from('jpegdata').toString('base64'), encoding: 'base64'}});

    const response = await image.GET(get('type=nieuws&slug=a'));

    expect(response.headers.get('content-type')).toBe('image/jpeg');
    expect(response.headers.get('cache-control')).toContain('private');
    expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('jpegdata');
  });

  it('returns 404 without an image', async () => {
    listDir.mockResolvedValue([]);

    expect((await image.GET(get('type=nieuws&slug=a'))).status).toBe(404);
  });
});
