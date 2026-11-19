import {NextResponse, type NextRequest} from 'next/server';
import {guardEditorApi} from '@lib/auth/api-guard';
import {saveVideoUpload} from '@lib/content-store/video-uploads';
import {maxVideoBytes, processVideo, VideoError} from '@lib/content-store/videos';

export const dynamic = 'force-dynamic';

const tooBig = 'Het filmpje is groter dan 25 MB. Kort het in of verklein het op je telefoon.';

/** Reads the body up to `limit` bytes and stops as soon as it is bigger. */
async function readCapped(request: NextRequest, limit: number): Promise<Buffer | undefined> {
  if (!request.body) {
    return Buffer.alloc(0);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop -- reading a stream chunk by chunk
    const {done, value} = await reader.read();
    if (done) {
      return Buffer.concat(chunks);
    }

    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return undefined;
    }

    chunks.push(value);
  }
}

/**
 * Upload of a news video (raw mp4 body), for editors only. It lives outside the proxy and outside
 * server actions, so only this route accepts 25 MB and only after the session is checked.
 */
export async function POST(request: NextRequest) {
  const guard = await guardEditorApi();
  if (guard.response) {
    return guard.response;
  }

  const origin = request.headers.get('origin');
  if (origin !== null && origin !== request.nextUrl.origin) {
    return NextResponse.json({error: 'Ongeldige herkomst'}, {status: 403});
  }

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > maxVideoBytes) {
    return NextResponse.json({error: tooBig}, {status: 413});
  }

  const body = await readCapped(request, maxVideoBytes);
  if (!body) {
    return NextResponse.json({error: tooBig}, {status: 413});
  }

  try {
    const id = await saveVideoUpload(guard.session.user.id, processVideo(body));
    return NextResponse.json({id});
  } catch (error) {
    if (error instanceof VideoError) {
      return NextResponse.json({error: error.message}, {status: 400});
    }

    console.error('Video upload failed', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({error: 'Het filmpje kon niet opgeslagen worden. Probeer het opnieuw.'}, {status: 500});
  }
}
