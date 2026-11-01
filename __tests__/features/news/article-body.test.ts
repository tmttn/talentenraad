import {splitQuotes} from '../../../app/features/news/article-body';

describe('splitQuotes', () => {
  it('splits text and top-level quotes in order', () => {
    expect(splitQuotes('<p>a</p><blockquote>\n<p>b</p>\n</blockquote><p>c</p>')).toEqual([
      {kind: 'html', html: '<p>a</p>'},
      {kind: 'quote', html: '<p>b</p>'},
      {kind: 'html', html: '<p>c</p>'},
    ]);
  });

  it('keeps html without quotes as one segment and drops empty gaps', () => {
    expect(splitQuotes('<p>a</p>')).toEqual([{kind: 'html', html: '<p>a</p>'}]);
    expect(splitQuotes('<blockquote><p>b</p></blockquote>\n')).toEqual([{kind: 'quote', html: '<p>b</p>'}]);
  });
});
