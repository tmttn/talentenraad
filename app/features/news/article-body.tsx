import {SpeechBubble} from '@components/ui';

type Segment = {kind: 'html' | 'quote'; html: string};

/**
 * Splits rendered (and sanitized) Markdown on its top-level blockquotes.
 * A Markdown `>` quote never nests here in practice; a nested one stays inside the outer quote.
 */
export function splitQuotes(html: string): Segment[] {
  const segments: Segment[] = [];
  const pattern = /<blockquote>([\s\S]*?)<\/blockquote>/g;
  let last = 0;
  for (const match of html.matchAll(pattern)) {
    const before = html.slice(last, match.index);
    if (before.trim() !== '') {
      segments.push({kind: 'html', html: before});
    }

    segments.push({kind: 'quote', html: match[1].trim()});
    last = match.index + match[0].length;
  }

  const rest = html.slice(last);
  if (rest.trim() !== '') {
    segments.push({kind: 'html', html: rest});
  }

  return segments;
}

const proseClassName = [
  'prose prose-lg max-w-none text-gray-800 prose-p:text-gray-800 prose-p:leading-[1.75]',
  'prose-headings:font-display prose-headings:text-black prose-strong:text-black',
  'prose-a:text-primary-text prose-a:font-semibold prose-a:underline-offset-2',
].join(' ');

/** Article text in a reading column; each Markdown blockquote becomes a green speech bubble. */
export function ArticleBody({html}: Readonly<{html: string}>) {
  return (
    <div className='flex flex-col gap-5'>
      {splitQuotes(html).map((segment, index) => (segment.kind === 'quote'
        ? (
          // Keyed by position: the segments come from one static string
          <figure key={index} className='my-2 pb-7'>
            <SpeechBubble tone='green' tail='bottom' size='md'>
              <blockquote
                className='font-display font-bold text-black text-[clamp(22px,2.2vw,28px)] leading-tight [&_p+p]:mt-3'
                dangerouslySetInnerHTML={{__html: segment.html}}
              />
            </SpeechBubble>
          </figure>
        )
        : <div key={index} className={proseClassName} dangerouslySetInnerHTML={{__html: segment.html}} />))}
    </div>
  );
}
