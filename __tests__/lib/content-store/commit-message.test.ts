// @vitest-environment node
import path from 'node:path';
import lint from '@commitlint/lint';
import load from '@commitlint/load';
import {describe, expect, it} from 'vitest';
import {commitMessage, maxTitleLength} from '@lib/content-store/commit-message';
import {entryTypes, type EntryType} from '@lib/content-store/entry-types';

// Lint the way the CLI in CI does (`npx commitlint --from HEAD~1 --to HEAD`): the repo's own config, plugins and parser.
async function lintMessage(message: string) {
  const config = await load({}, {cwd: path.resolve(import.meta.dirname, '../../..')});
  const result = await lint(message, config.rules, {
    plugins: config.plugins,
    parserOpts: config.parserPreset?.parserOpts as Record<string, unknown> | undefined,
  });
  return {valid: result.valid, errors: result.errors.map(error => error.name)};
}

const longTitle = 'Een heel lange titel voor een activiteit die maar blijft doorgaan, met nog meer woorden erachter';

describe('commitMessage', () => {
  it('builds the editor message', () => {
    expect(commitMessage('bijwerken', 'team', 'Bart Wijnen')).toBe('content: bijwerken team "Bart Wijnen"');
  });

  it('flattens whitespace and swaps double quotes', () => {
    expect(commitMessage('toevoegen', 'nieuws', '  De "grote"\n  quiz ')).toBe('content: toevoegen nieuws "De \'grote\' quiz"');
  });

  it('shortens long titles with an ellipsis', () => {
    const message = commitMessage('verwijderen', 'activiteiten', longTitle);
    const title = /"(.*)"$/.exec(message)?.[1] ?? '';
    expect(title).toHaveLength(maxTitleLength);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('commitMessage against commitlint.config.js', () => {
  it('accepts the message that broke CI on main', async () => {
    expect(await lintMessage('content: bijwerken team "Bart Wijnen"')).toEqual({valid: true, errors: []});
  });

  const subjects = [...Object.keys(entryTypes) as EntryType[], 'aankondiging' as const];
  const verbs = ['toevoegen', 'bijwerken', 'verwijderen'] as const;

  it.each(subjects.flatMap(subject => verbs.map(verb => [verb, subject] as const)))(
    'accepts %s %s, also with the longest title',
    async (verb, subject) => {
      for (const title of ['Pizzaverkoop [TEST]', 'Update: 50% korting (zaterdag) #2 😀', longTitle, '']) {
        const message = commitMessage(verb, subject, title);
        expect({message, ...await lintMessage(message)}).toEqual({message, valid: true, errors: []});
      }
    },
  );

  it('still rejects an unknown type', async () => {
    const result = await lintMessage('inhoud: bijwerken team "Bart Wijnen"');
    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(['type-enum', 'header-pattern']));
  });
});
