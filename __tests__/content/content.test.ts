// @vitest-environment node
import {readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import {createContentReader} from '../../app/lib/content/reader';
import {paginaSchemas, type PaginaNaam} from '../../app/lib/content/schemas';
import {findDisallowedEmails} from '../../scripts/migrate-content/transform';

const root = path.resolve('content');
const allowlist = ['voorzitterouderraad@talentenhuis.be', 'contact@apd-gba.be'];

function textFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      return textFiles(full);
    }

    return /\.(md|ya?ml)$/.test(name) ? [full] : [];
  });
}

describe('content/', () => {
  const reader = createContentReader(root, {includeConcepts: true});

  it('loads every collection and page against the schemas', () => {
    expect(reader.getSite().navigatie.length).toBeGreaterThan(0);
    expect(reader.getActiviteiten().length).toBeGreaterThan(0);
    expect(reader.getNieuws().length).toBeGreaterThan(0);
    expect(reader.getTeam().length).toBeGreaterThan(0);
    expect(reader.getFaq().length).toBeGreaterThan(0);
    expect(reader.listTeksten().length).toBeGreaterThan(0);
    for (const naam of Object.keys(paginaSchemas) as PaginaNaam[]) {
      expect(reader.getPagina(naam).titel).not.toBe('');
    }
  });

  it('resolves activity images', () => {
    const withImage = reader.getActiviteiten().filter(item => item.afbeelding !== undefined);
    expect(withImage.length).toBeGreaterThan(0);
  });

  it('contains no e-mail addresses outside the allowlist', () => {
    const all = textFiles(root).map(file => readFileSync(file, 'utf8')).join('\n');
    expect(findDisallowedEmails(all, allowlist)).toEqual([]);
  });
});
