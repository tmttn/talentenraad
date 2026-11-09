// @vitest-environment node
import lint from '@commitlint/lint';
import load from '@commitlint/load';
import {commitMessage, commitTitelMax} from '@lib/content-store/commit-message';

// CI runs commitlint on every push to main, editor saves included
const lintMessage = async (message: string) => {
  const config = await load({}, {cwd: process.cwd()});
  const result = await lint(message, config.rules, {
    plugins: config.plugins,
    ...(config.parserPreset?.parserOpts ? {parserOpts: config.parserPreset.parserOpts as Record<string, unknown>} : {}),
  });
  return result.errors.map(error => error.name);
};

describe('commitMessage', () => {
  it('writes verb, kind and title on one line', () => {
    expect(commitMessage('bijwerken', 'activiteiten', 'Valentijnactie 2027')).toBe('content: bijwerken activiteiten "Valentijnactie 2027"');
    expect(commitMessage('bijwerken', 'aankondiging', 'Geen  training\nvandaag "dus"')).toBe('content: bijwerken aankondiging "Geen training vandaag \'dus\'"');
  });

  it('cuts long titles', () => {
    const message = commitMessage('verwijderen', 'aankondiging', `${'woord '.repeat(40)}`);
    expect(message.length).toBeLessThanOrEqual('content: verwijderen aankondiging ""'.length + commitTitelMax);
    expect(message).toMatch(/[^ ]"$/);
  });

  it('passes commitlint, also with the longest verb, kind and title', async () => {
    expect(await lintMessage(commitMessage('toevoegen', 'nieuws', 'Nieuwe brief'))).toEqual([]);
    expect(await lintMessage(commitMessage('verwijderen', 'aankondiging', 'x'.repeat(300)))).toEqual([]);
  });

  it('still rejects unknown types', async () => {
    expect(await lintMessage('inhoud: bijwerken nieuws "Brief"')).toContain('type-enum');
  });
});
