import type {Root, RootContent} from 'hast';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import {unified} from 'unified';

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

// Same pipeline up to the sanitized HTML tree, without turning it into a string
const toSanitizedTree = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize);

const stringifier = unified().use(rehypeStringify);

export function renderMarkdown(markdown: string): string {
  return String(processor.processSync(markdown));
}

/** A run of ordinary HTML, or the contents of one top-level quote. */
export type MarkdownSegment = {kind: 'html' | 'quote'; html: string};

const stringify = (children: RootContent[]) => stringifier.stringify({type: 'root', children} satisfies Root);

/**
 * Renders Markdown as segments: top-level blockquotes apart from the rest, so a page can style them
 * (a speech bubble). The split happens on the sanitized tree, never on the HTML string, so every
 * segment is balanced, sanitized markup and a quote-like string inside an attribute cannot cut it.
 */
export function renderMarkdownSegments(markdown: string): MarkdownSegment[] {
  const tree = toSanitizedTree.runSync(toSanitizedTree.parse(markdown)) as Root;
  const segments: MarkdownSegment[] = [];
  let run: RootContent[] = [];

  const flush = () => {
    if (run.some(node => node.type !== 'text' || node.value.trim() !== '')) {
      segments.push({kind: 'html', html: stringify(run)});
    }

    run = [];
  };

  for (const node of tree.children) {
    if (node.type === 'element' && node.tagName === 'blockquote') {
      flush();
      segments.push({kind: 'quote', html: stringify(node.children).trim()});
    } else {
      run.push(node);
    }
  }

  flush();
  return segments;
}
