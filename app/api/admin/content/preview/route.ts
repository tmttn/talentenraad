import {NextResponse, type NextRequest} from 'next/server';
import {guardEditorApi} from '@lib/auth/api-guard';
import {renderMarkdown} from '@lib/content/markdown';

const maxLength = 50 * 1024;

/** Renders Markdown with the same (sanitizing) renderer as the site, for the live preview in the editor. */
export async function POST(request: NextRequest) {
  const guard = await guardEditorApi();
  if (guard.response) {
    return guard.response;
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > maxLength * 2) {
    return NextResponse.json({error: 'Te groot'}, {status: 413});
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Ongeldige invoer'}, {status: 400});
  }

  const markdown = (body as {markdown?: unknown} | null)?.markdown;
  if (typeof markdown !== 'string') {
    return NextResponse.json({error: 'Ongeldige invoer'}, {status: 400});
  }

  if (markdown.length > maxLength) {
    return NextResponse.json({error: 'Te groot'}, {status: 413});
  }

  return NextResponse.json({html: renderMarkdown(markdown)});
}
