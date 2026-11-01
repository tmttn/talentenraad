import {NextResponse, type NextRequest} from 'next/server';
import {guardEditorApi} from '@lib/auth/api-guard';
import {entryPaths} from '@lib/content-store/entries';
import {entryTypes, isEntryType} from '@lib/content-store/entry-types';
import {api, listDir} from '@lib/content-store/github';

export const dynamic = 'force-dynamic';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Serves the current photo of an item straight from the content branch, so the GitHub token never reaches the browser. */
export async function GET(request: NextRequest) {
  const guard = await guardEditorApi();
  if (guard.response) {
    return guard.response;
  }

  const type = request.nextUrl.searchParams.get('type') ?? '';
  const slug = request.nextUrl.searchParams.get('slug') ?? '';
  if (!isEntryType(type) || entryTypes[type].singleFile || !slugPattern.test(slug)) {
    return NextResponse.json({error: 'Ongeldige invoer'}, {status: 400});
  }

  try {
    const paths = entryPaths(type, slug);
    const entry = (await listDir(paths.dir)).find(item => item.path === paths.image);
    if (!entry) {
      return NextResponse.json({error: 'Niet gevonden'}, {status: 404});
    }

    const blob = await api('GET', `/git/blobs/${encodeURIComponent(entry.sha)}`);
    const content = (blob.data as {content?: unknown} | undefined)?.content;
    if (typeof content !== 'string') {
      return NextResponse.json({error: 'Niet gevonden'}, {status: 404});
    }

    return new NextResponse(Buffer.from(content, 'base64'), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=60',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({error: 'Niet beschikbaar'}, {status: 502});
  }
}
