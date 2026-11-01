import {SpeechBubble} from '@components/ui';
import type {MarkdownSegment} from '@lib/content';

const proseClassName = [
  'prose prose-lg max-w-none text-gray-800 prose-p:text-gray-800 prose-p:leading-[1.75]',
  'prose-headings:font-display prose-headings:text-black prose-strong:text-black',
  'prose-a:text-primary-text prose-a:font-semibold prose-a:underline-offset-2',
].join(' ');

/**
 * Article text in a reading column; each top-level Markdown quote becomes a green speech bubble.
 * The segments come from the content reader, split on the sanitized tree (see renderMarkdownSegments).
 */
export function ArticleBody({segmenten}: Readonly<{segmenten: MarkdownSegment[]}>) {
  return (
    <div className='flex flex-col gap-5'>
      {segmenten.map((segment, index) => (segment.kind === 'quote'
        ? (
          // Keyed by position: the segments are a fixed list per article
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
