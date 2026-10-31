# Contentmodel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Content uit de lokale Builder-export als gevalideerde Markdown/YAML in `content/` zetten, met een typed loader die stap 3 kan gebruiken.

**Architecture:** Zod-schema's definiëren het model; een kleine server-side loader in `app/lib/content/` leest `content/` van schijf bij de build. Een eenmalig migratiescript (`scripts/migrate-content/`, TypeScript via `tsx`) zet `content-export/` om en valideert het resultaat met dezelfde loader. Een Vitest-test valideert de echte `content/` bij elke commit. Eerst wordt Jest vervangen door Vitest (Task 0, Tom: "Je mag de jest setup weggooien en vitest gebruiken").

**Tech Stack:** Next.js 16, TypeScript strict, zod 4, gray-matter, js-yaml, unified (remark-parse, remark-gfm, remark-rehype, rehype-sanitize, rehype-stringify), image-size, turndown, tsx, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-30-contentmodel-design.md`

## Global Constraints

- Veldnamen in het Nederlands, exact zoals in de spec.
- Geen wijziging aan wat de site rendert; pagina's blijven Builder lezen tot stap 3.
- `content-export/` blijft lokaal (gitignored); tests mogen er niet van afhangen.
- Alleen actieve teamleden; geen `actief`-veld in `content/`.
- Geen e-mailadres in `content/` behalve `voorzitterouderraad@talentenhuis.be` en `contact@apd-gba.be`.
- Pre-commit hook (lint, type-check, test:coverage) moet slagen; geen `--no-verify`; coverage-drempel 50% niet aanraken.
- Codestijl van de repo: enkele quotes, 2 spaties, `??`, `item => …`.

- Coverage-drempel: 50% voor branches, functions, lines, statements, met dezelfde uitsluitingen als `jest.config.ts`; provider `istanbul` (zelfde telling als Jest).

## Review Focus

1. **YAML-datums**: gray-matter maakt van `datum: 2025-02-07` een `Date`. Schema moet `Date` én string accepteren en altijd `'YYYY-MM-DD'` teruggeven, zonder tijdzoneverschuiving (UTC). Test in Task 1.
2. **Kapot bestand van de editor**: ontbrekend verplicht veld of onbekende `categorie` moet falen met het bestandspad in de foutmelding. Test in Task 3.
3. **Afbeelding waarnaar frontmatter verwijst bestaat niet**: build faalt met pad, geen stille `undefined`. Test in Task 2.
4. **HTML in Markdown-body** (`<script>`, `onerror=`) wordt gestript. Test in Task 2.
5. **Slug-botsing** (twee items met dezelfde schone slug of een alias die een bestaande slug is): migratie faalt. Test in Task 5.

---

### Task 0: Jest → Vitest

**Files:**
- Create: `vitest.config.mts`, `vitest.setup.tsx`
- Delete: `jest.config.ts`, `jest.setup.tsx`, `jest.env.setup.ts`
- Modify: alle `__tests__/**` die `jest.*` gebruiken; `package.json` (scripts, deps); `.husky/pre-commit`; `.github/workflows/ci.yml` (indien Jest-specifiek); `eslint.config.mjs` (override `jest.*` → `vitest.*`); `CLAUDE.md` (secties "Jest Configuration", "After Refactoring", "Configuration Restrictions", "Common Mistakes", projectregels die `jest.config.ts` noemen)

**Interfaces:**
- Produces: `npm test` = `vitest run`, `npm run test:coverage` = `vitest run --coverage`; per-bestand node-omgeving via `// @vitest-environment node`. Latere taken gebruiken `npx vitest run <pad>`.

- [ ] **Step 1: Baseline vastleggen** — `npm run test:coverage` onder Jest; noteer aantal tests (880) en de vier coverage-percentages.

- [ ] **Step 2: Deps** — `npm uninstall jest jest-environment-jsdom && npm install -D vitest @vitest/coverage-istanbul @vitejs/plugin-react vite-tsconfig-paths jsdom`. `@testing-library/jest-dom` blijft (import `@testing-library/jest-dom/vitest`).

- [ ] **Step 3: `vitest.config.mts`** — plugins `react()` en `tsconfigPaths()`; `test: {environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.tsx'], include: ['__tests__/**/*.test.{ts,tsx}'], env: {NEXT_PUBLIC_BUILDER_API_KEY: 'test-builder-api-key'}}`; `coverage: {provider: 'istanbul', include: ['app/**/*.{ts,tsx}'], exclude: <exact de uitsluitingen uit jest.config.ts>, thresholds: {branches: 50, functions: 50, lines: 50, statements: 50}}`. Neem de commentaarregel over dat Claude de drempels niet mag verlagen.

- [ ] **Step 4: `vitest.setup.tsx`** — inhoud van `jest.setup.tsx` met `jest.` → `vi.`; mock-factories die buiten-variabelen gebruiken (bv. `mockFlagValues`) via `vi.hoisted`.

- [ ] **Step 5: Tests omzetten** — mechanisch `jest.fn|mock|spyOn|useFakeTimers|advanceTimersByTime|…` → `vi.*`, `jest.Mock` → `Mock` / `jest.Mocked<T>` → `Mocked<T>` (import type uit `vitest`). Handwerk:
  - `jest.mock`-factories die naar variabelen in het testbestand verwijzen → `vi.hoisted`.
  - `jest.requireActual(x)` → `await vi.importActual<typeof import('x')>(x)` in een `async`-factory.
  - `jest.resetModules`/`isolateModules` (6×) → `vi.resetModules()` + dynamische `await import()`.
  - `require()` in tests (2×) → `await import()`.
  - Default-export-mocks: Vitest verwacht `{default: …}`; `__esModule: true` mag weg.

- [ ] **Step 6: Verifieer** — `npm run test:coverage`: zelfde aantal tests als de baseline, allemaal groen, coverage ≥ 50% op alle vier. Een test die alleen onder Vitest faalt: oorzaak zoeken, test niet verwijderen of overslaan. Lukt dat niet: stoppen en Tom vragen.

- [ ] **Step 7: Scripts en documentatie** — `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`; hook en CI gebruiken die scripts; CLAUDE.md: Jest-secties vervangen door Vitest-equivalent, `vitest.config.mts` in de lijst met beschermde bestanden i.p.v. `jest.config.ts`; de regel over het escapen van `(main)` in globs geldt ook voor `coverage.exclude`.

- [ ] **Step 8: Checklist + commit** — `npm run lint && npm run type-check && npm run test:coverage && npm run build`; commit `test: migrate from Jest to Vitest`.

---

### Task 1: Dependencies, slugify en schema's

**Files:**
- Modify: `package.json` (deps)
- Create: `app/lib/content/slugify.ts`, `app/lib/content/schemas.ts`
- Test: `__tests__/lib/content/slugify.test.ts`, `__tests__/lib/content/schemas.test.ts`

**Interfaces:**
- Produces:
  - `slugify(text: string): string`, `legacySlug(text: string): string`
  - Schema's (zod, frontmatter-vorm): `activiteitSchema`, `nieuwsSchema`, `teamlidSchema`, `faqSchema`, `tekstSchema`, `siteSchema`, `paginaSchemas: {home, kalender, nieuws, contact, 'over-ons', sponsors}`
  - `datumSchema` (Date | string → `'YYYY-MM-DD'`)
  - Types: `PaginaNaam = keyof typeof paginaSchemas`, en `z.infer`-types `ActiviteitFrontmatter`, `NieuwsFrontmatter`, `TeamlidFrontmatter`, `FaqFrontmatter`, `TekstFrontmatter`, `Site`, `PaginaFrontmatter<K>`

- [ ] **Step 1: Installeer deps**

Run: `npm install zod@^4 gray-matter js-yaml unified remark-parse remark-gfm remark-rehype rehype-sanitize rehype-stringify image-size && npm install -D tsx turndown @types/js-yaml @types/turndown`
Expected: geen `ERESOLVE`; `npm ls zod` toont 4.x.

- [ ] **Step 2: Schrijf falende tests**

`slugify.test.ts`:
```ts
expect(legacySlug('🎉 De Talentenfuif 2025 komt eraan!')).toBe('-de-talentenfuif-2025-komt-eraan');
expect(slugify('🎉 De Talentenfuif 2025 komt eraan!')).toBe('de-talentenfuif-2025-komt-eraan');
expect(slugify('Kerstspel en Kerstinstuif 2025')).toBe('kerstspel-en-kerstinstuif-2025');
expect(slugify('Moederdag Ontbijtmanden 2025')).toBe('moederdag-ontbijtmanden-2025');
expect(slugify('Café één')).toBe('cafe-een');
```
`legacySlug` is een exacte kopie van `generateSlug` uit `app/features/activities/activities-list.tsx:46`; `slugify` = `legacySlug` + streepjes aan begin/eind weg.

`schemas.test.ts` (minstens):
```ts
expect(datumSchema.parse(new Date('2025-02-07T00:00:00Z'))).toBe('2025-02-07');
expect(datumSchema.parse('2025-02-07')).toBe('2025-02-07');
expect(() => datumSchema.parse('7 februari')).toThrow();
expect(activiteitSchema.parse({titel: 'X', datum: '2025-01-01', categorie: 'feest', samenvatting: 'Y'}))
  .toMatchObject({concept: false, aliassen: []});
expect(() => activiteitSchema.parse({titel: 'X', datum: '2025-01-01', categorie: 'bbq', samenvatting: 'Y'})).toThrow();
expect(() => teamlidSchema.parse({naam: 'A', rol: 'Lid', categorie: 'helper'})).toThrow();
expect(teamlidSchema.parse({naam: 'A', rol: 'Lid', categorie: 'lid'}).volgorde).toBe(99);
expect(() => paginaSchemas.home.parse({titel: 'T', beschrijving: 'B', hero: {titel: 'H', ondertitel: 'O'},
  cta: {titel: 'C', tekst: 'T', knoppen: []}, dashboardTitel: 'D', infokaart: {titel: 'I'}, faqTitel: 'F'})).toThrow(); // 0 knoppen
expect(siteSchema.shape.aankondiging.shape.type.options).toEqual(['info', 'waarschuwing', 'belangrijk']);
```

- [ ] **Step 3: Run, verwacht FAIL** — `npx vitest run __tests__/lib/content` → "Cannot find module".

- [ ] **Step 4: Implementeer `slugify.ts` en `schemas.ts`**

Schema-velden exact uit de spec. Vastgelegde details:
- Overal optioneel `concept: z.boolean().default(false)`; activiteit/nieuws ook `aliassen: z.array(z.string()).default([])`.
- `activiteit.categorie`: `z.enum(['feest', 'kalender', 'activiteit'])` (data + bestaande component). `tijd`, `locatie`, `afbeelding` optioneel; `afbeelding` is een string met relatief pad (`./…`).
- `teamlid.categorie`: `z.enum(['bestuur', 'lid'])`; `volgorde` default 99; `foto` optioneel.
- `faq`: `vraag`, `volgorde` (default 99).
- `tekst`: `titel`, `beschrijving`.
- Pagina's: gemeenschappelijk `basisPagina = {titel, beschrijving, hero: {titel, ondertitel}, cta?: {titel, tekst, knoppen: array(min 1, max 2) van {tekst, link}}}`, uitgebreid per pagina zoals de tabel in de spec; `sponsors.niveau` ∈ `goud|zilver|brons|partner`, `legeTekst: {goud, zilver, brons, partner}`.
- `site.decoraties`: zelfde vorm als `SeasonalDecorationsConfig` in `app/lib/types.ts:8` (Engelse sleutels, 1-op-1).
- `site.aankondiging.type`: `z.enum(['info', 'waarschuwing', 'belangrijk'])` (uit `app/features/marketing/announcement-banner.tsx:18`).
- `datumSchema`: `Date` → `toISOString().slice(0, 10)`; string moet `/^\d{4}-\d{2}-\d{2}$/` matchen.

- [ ] **Step 5: Run, verwacht PASS** — `npx vitest run __tests__/lib/content`

- [ ] **Step 6: Commit** — `feat(content): add content schemas and slugify`

---

### Task 2: Markdown, afbeeldingen en bestanden lezen

**Files:**
- Create: `app/lib/content/markdown.ts`, `app/lib/content/files.ts`
- Create: `__tests__/fixtures/content/…` (kleine fixture-boom, zie Task 3; hier minstens één map met `index.md` + 2×2 px `foto.png`)
- Test: `__tests__/lib/content/markdown.test.ts`, `__tests__/lib/content/files.test.ts` (beide `// @vitest-environment node`)

**Interfaces:**
- Consumes: niets uit Task 1 behalve types.
- Produces:
  - `renderMarkdown(markdown: string): string` — HTML, gesanitized
  - `type ContentImage = {src: string; width: number; height: number}`
  - `resolveImage(rootDir: string, entryDir: string, ref: string): ContentImage` — `entryDir` relatief t.o.v. `rootDir` (bv. `activiteiten/talentenfuif`); `src` = `/content/${entryDir}/${bestand}`
  - `readMarkdownFile(file: string): {data: Record<string, unknown>; body: string}`
  - `readYamlFile(file: string): unknown`

- [ ] **Step 1: Falende tests**

```ts
expect(renderMarkdown('**vet**')).toContain('<strong>vet</strong>');
expect(renderMarkdown('<script>alert(1)</script>tekst')).not.toContain('<script');
expect(renderMarkdown('<img src=x onerror="alert(1)">')).not.toContain('onerror');
expect(renderMarkdown('[link](https://talentenhuis.be)')).toContain('href="https://talentenhuis.be"');
expect(resolveImage(fixtures, 'activiteiten/met-foto', './foto.png'))
  .toEqual({src: '/content/activiteiten/met-foto/foto.png', width: 2, height: 2});
expect(() => resolveImage(fixtures, 'activiteiten/met-foto', './bestaat-niet.jpg')).toThrow(/bestaat-niet\.jpg/);
expect(() => resolveImage(fixtures, 'activiteiten/met-foto', '../../site.yaml')).toThrow(); // geen pad buiten entryDir
```

- [ ] **Step 2: Run, verwacht FAIL**

- [ ] **Step 3: Implementeer** — `unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSanitize).use(rehypeStringify).processSync()` (synchroon; `rehype-sanitize` met het default GitHub-schema); `imageSize(readFileSync(pad))` uit `image-size` (v2-API) voor afmetingen; raw HTML in Markdown valt weg (`remark-rehype` zonder `allowDangerousHtml`), sanitize is een tweede vangnet; `gray-matter` voor Markdown, `js-yaml` voor YAML.

- [ ] **Step 4: Run, verwacht PASS**

- [ ] **Step 5: Commit** — `feat(content): markdown rendering and image resolution`

---

### Task 3: Content-reader

**Files:**
- Create: `app/lib/content/reader.ts`, `app/lib/content/index.ts`
- Create: `__tests__/fixtures/content/` (volledige mini-boom: `site.yaml`, alle 6 `paginas/*.md`, 1 `teksten/*.md`, 3 activiteiten waarvan 1 `concept: true` en 1 met foto, 2 nieuws, 3 teamleden, 2 faq)
- Test: `__tests__/lib/content/reader.test.ts` (`// @vitest-environment node`)

**Interfaces:**
- Consumes: schema's (Task 1), `readMarkdownFile`, `readYamlFile`, `resolveImage`, `renderMarkdown` (Task 2).
- Produces:
  - `createContentReader(rootDir: string, options?: {includeConcepts?: boolean})` met methoden:
    - `getSite(): Site`
    - `getPagina<K extends PaginaNaam>(naam: K): PaginaFrontmatter<K> & {html: string}` (afbeelding-/logo-velden opgelost naar `ContentImage`)
    - `listTeksten(): Tekst[]`, `getTekst(slug: string): Tekst | undefined`
    - `getActiviteiten(): Activiteit[]` (op `datum` oplopend), `getActiviteit(slug: string): Activiteit | undefined` (matcht ook `aliassen`)
    - `getNieuws(): NieuwsItem[]` (op `datum` aflopend), `getNieuwsItem(slug: string): NieuwsItem | undefined` (ook `aliassen`)
    - `getTeam(): Teamlid[]` (`volgorde`, dan `naam`), `getFaq(): FaqItem[]` (`volgorde`, dan `vraag`)
  - Item-types = frontmatter + `slug: string` + `html: string`, met `afbeelding`/`foto` als `ContentImage | undefined`
  - `index.ts`: `export const content = createContentReader(path.join(process.cwd(), 'content'), {includeConcepts: process.env.NODE_ENV === 'development'})` + re-export types
  - Een item is een map met `index.md` of een los `<slug>.md`; beide ondersteund in elke collectie en voor `paginas/sponsors`.

- [ ] **Step 1: Fixture-boom aanmaken**, geldig volgens de schema's.

- [ ] **Step 2: Falende tests**

```ts
const reader = createContentReader(fixtures);
expect(reader.getActiviteiten().map(a => a.slug)).toEqual([/* 2 niet-concept, oplopend op datum */]);
expect(createContentReader(fixtures, {includeConcepts: true}).getActiviteiten()).toHaveLength(3);
expect(reader.getActiviteit('oude-slug')?.slug).toBe('nieuwe-slug'); // via aliassen
expect(reader.getActiviteit('met-foto')?.afbeelding?.src).toBe('/content/activiteiten/met-foto/foto.png');
expect(reader.getPagina('over-ons').html).toContain('<p>');
expect(reader.getTeam()[0].categorie).toBe('bestuur'); // laagste volgorde eerst
expect(reader.getTekst('bestaat-niet')).toBeUndefined();
```
Plus foutgeval: een tijdelijke kopie van de fixture met een activiteit zonder `titel` →
```ts
expect(() => createContentReader(tmp).getActiviteiten()).toThrow(/activiteiten\/kapot.*titel/s);
```

- [ ] **Step 3: Run, verwacht FAIL**

- [ ] **Step 4: Implementeer `reader.ts` en `index.ts`** — fouten van zod gewrapt in `new Error(\`${relatiefPad}: ${zodError.message}\`)`; resultaten per reader-instantie gecachet (build leest elk bestand één keer).

- [ ] **Step 5: Run, verwacht PASS**; `npm run type-check` groen.

- [ ] **Step 6: Commit** — `feat(content): typed content reader`

---

### Task 4: Afbeeldingen naar `public/` bij build en dev

**Files:**
- Create: `scripts/copy-content-assets.mjs`
- Modify: `package.json` (`prebuild`, `predev`), `.gitignore` (`/public/content/`)
- Test: `__tests__/scripts/copy-content-assets.test.ts` (`// @vitest-environment node`)

**Interfaces:**
- Produces: `copyContentAssets(contentDir: string, publicDir: string): Promise<string[]>` (export uit het `.mjs`; retourneert gekopieerde relatieve paden). Kopieert alle niet-`.md`/`.yaml`-bestanden met behoud van pad naar `publicDir/content/`, na eerst `publicDir/content/` te wissen. Script draait het met `content` en `public` als het direct wordt aangeroepen.

- [ ] **Step 1: Falende test** — op de fixture-boom naar een tmp-dir: resultaat bevat `activiteiten/met-foto/foto.png`, geen `.md` of `site.yaml`; een vooraf aanwezig verouderd bestand in `tmp/content/` is weg.
- [ ] **Step 2: Run, verwacht FAIL**
- [ ] **Step 3: Implementeer** (`fs.cp` met filter) en voeg `"prebuild": "node scripts/copy-content-assets.mjs"`, `"predev": "node scripts/copy-content-assets.mjs"` toe.
- [ ] **Step 4: Run, verwacht PASS**; `npm run build` slaagt (content/ mag nog niet bestaan: script moet dan niets doen).
- [ ] **Step 5: Commit** — `build(content): copy content images to public at build`

---

### Task 5: Migratie-transformaties

**Files:**
- Create: `scripts/migrate-content/transform.ts` (pure functies), `scripts/migrate-content/pages.ts` (pagina-mapping)
- Test: `__tests__/scripts/migrate-content/transform.test.ts`, `__tests__/scripts/migrate-content/pages.test.ts` — met kleine inline fixtures, **niet** met `content-export/`

**Interfaces:**
- Consumes: `slugify`, `legacySlug`, schema-types (Task 1).
- Produces:
  - `htmlToMarkdown(html: string): string` (turndown, ATX-koppen, `-` bullets)
  - `stripPersonalEmails(markdown: string, allowlist: string[]): string` — verwijdert `Contact: <adres>` (met optionele omliggende `mailto:`-link) voor adressen buiten de allowlist
  - `findDisallowedEmails(text: string, allowlist: string[]): string[]`
  - `slugsFor(titel: string): {slug: string; aliassen: string[]}` — `aliassen` = `[legacySlug(titel)]` als die verschilt, anders `[]`
  - `assertUniqueSlugs(items: {collectie: string; slug: string; aliassen: string[]}[]): void` — gooit bij dubbele slug of alias die een slug/alias elders is, per collectie
  - `extractTexts(blocks: unknown[]): {component: string; options: Record<string, unknown>; text?: string}[]` — Builder-blockboom in documentvolgorde plat, `Typography`/`Text`-tekst in `text`, HTML gestript naar platte tekst
  - `mapPagina(url: string, entry: BuilderPage): {naam: PaginaNaam; frontmatter: unknown; body: string} | {tekst: string; frontmatter: unknown; body: string}` in `pages.ts` — URL → pagina of tekstpagina; `/algemene-voorwaarden`, `/cookiebeleid`, `/privacybeleid` → `teksten/`
  - `type BuilderPage` = minimale vorm `{name: string; data: {url: string; title?: string; description?: string; blocks: unknown[]}}`

- [ ] **Step 1: Falende tests**

```ts
expect(slugsFor('🎉 De Talentenfuif 2025 komt eraan!'))
  .toEqual({slug: 'de-talentenfuif-2025-komt-eraan', aliassen: ['-de-talentenfuif-2025-komt-eraan']});
expect(slugsFor('Moederdag Ontbijtmanden 2025').aliassen).toEqual([]);
expect(stripPersonalEmails('Mededeling: naam\nContact: ouder@voorbeeld.be', allow))
  .toBe('Mededeling: naam');
expect(stripPersonalEmails('Mail voorzitterouderraad@talentenhuis.be', allow)).toContain('voorzitterouderraad@');
expect(findDisallowedEmails('x a@b.be y contact@apd-gba.be', allow)).toEqual(['a@b.be']);
expect(() => assertUniqueSlugs([{collectie: 'nieuws', slug: 'a', aliassen: []}, {collectie: 'nieuws', slug: 'a', aliassen: []}])).toThrow(/a/);
expect(() => assertUniqueSlugs([{collectie: 'nieuws', slug: 'a', aliassen: ['b']}, {collectie: 'nieuws', slug: 'b', aliassen: []}])).toThrow();
expect(htmlToMarkdown('<p>Hallo <strong>wereld</strong></p><h3>Kop</h3>')).toBe('Hallo **wereld**\n\n### Kop');
```
`pages.test.ts`: inline `BuilderPage` voor `/over-ons` met de blokstructuur uit de spec (Hero → 2 Typography; InfoCard met `title`/`description` → Typography's + 2 TeamGrid; CTABanner → 2 Typography + CTAButton) → verwacht frontmatter:
```ts
{titel: 'Over Ons - Talentenraad', beschrijving: '<lead-tekst>', hero: {titel: 'De Talentenraad', ondertitel: '<lead>'},
 infokaart: {titel: 'Onze Missie'}, bestuur: {titel: 'Het Bestuur', tekst: '…'}, leden: {titel: 'Onze Leden', tekst: '…'},
 cta: {titel: 'Wil je meehelpen?', tekst: '…', knoppen: [{tekst: 'Neem contact op', link: '/contact'}]}}
```
en `body` = Markdown van de InfoCard-`description`. Plus een test voor `/privacybeleid` (Box → Text-HTML) → `{tekst: 'privacybeleid', …}` met body in Markdown.

- [ ] **Step 2: Run, verwacht FAIL**

- [ ] **Step 3: Implementeer.** Vastgelegde regels voor `mapPagina`:
  - `titel` = Builder `title` als die er is, anders `${entry.name} - Talentenraad`; `beschrijving` = Builder `description`, anders `hero.ondertitel`.
  - Teksten worden per pagina op positie gekozen uit `extractTexts` (Hero: 1e = `hero.titel`, 2e = `hero.ondertitel`); `UnifiedCta`/`UnifiedCTA`/`CTABanner` met `title`/`description`/`buttonText`/`buttonLink`-opties of met Typography + CTAButton-kinderen → `cta`.
  - Kalender: `ActivitiesArchive.options.title/subtitle` → `archief`. Sponsors: vier `Section`s → `legeTekst.goud|zilver|brons|partner` (tweede Text), `sponsors: []`.
  - Onbekende URL → fout met de URL.

- [ ] **Step 4: Run, verwacht PASS**

- [ ] **Step 5: Commit** — `feat(content): migration transforms for Builder export`

---

### Task 6: Migratie draaien en `content/` committen

**Files:**
- Create: `scripts/migrate-content/index.ts` (CLI), `__tests__/content/content.test.ts`
- Modify: `package.json` (`"migrate:content": "tsx scripts/migrate-content/index.ts"`), `CLAUDE.md` (stap 2 afvinken)
- Create (gegenereerd): `content/**`

**Interfaces:**
- Consumes: alles uit Task 1–5.

- [ ] **Step 1: Implementeer de CLI**, in deze volgorde:
  1. Lees `content-export/{page,activiteit,nieuws,teamlid,faq,site-header,site-footer,footer-cta,aankondiging}.json` en `_assets.json`; ontbreekt `content-export/` → duidelijke fout.
  2. Wis `content/`. Alleen `published === 'published'`; teamleden alleen `actief === true`.
  3. Schrijf collecties (`gray-matter`'s `stringify`): activiteiten/nieuws/team als `<slug>/index.md`, faq als `<slug>.md` (`slug = slugify(vraag)`), team-`slug = slugify(naam)`, body = `htmlToMarkdown(inhoud | beschrijving | antwoord)` → `stripPersonalEmails`.
  4. Afbeelding: Builder-URL → bestand via `_assets.json` → kopie naar `content/activiteiten/<slug>/afbeelding.<ext>`, frontmatter `afbeelding: ./afbeelding.<ext>`. Velden `screenshot` en de trackingpixel negeren.
  5. Pagina's via `mapPagina`.
  6. `site.yaml`: `navigatie` uit `site-header.navigationLinks`; `footer` uit `site-footer`; `cta` uit de gepubliceerde `footer-cta` met naam "Footer CTA - Sitewide"; `aankondiging` uit `aankondiging.json`; `decoraties` = `{enabled: false, season: 'none', decorations: {alle false}}` tenzij Tom de huidige waarde aanlevert.
  7. `assertUniqueSlugs`; daarna `findDisallowedEmails` over alle geschreven bestanden → fout als niet leeg.
  8. Valideer met `createContentReader('content', {includeConcepts: true})`: roep elke getter aan en `getPagina` voor elke `PaginaNaam`.
  9. Print per collectie het aantal.

- [ ] **Step 2: Draai** `npm run migrate:content`
Expected: `activiteiten 4, nieuws 2, team 11, faq 2, paginas 6, teksten 3`, geen fouten.

- [ ] **Step 3: Schrijf `content.test.ts`** (`// @vitest-environment node`): laadt de echte `content/` met `includeConcepts: true`, roept alle getters aan (zoals Step 1.8), en `expect(findDisallowedEmails(alleTekst, allowlist)).toEqual([])`. Run: `npx vitest run __tests__/content` → PASS.

- [ ] **Step 4: Handmatige controle** (resultaat rapporteren aan Tom):
  - `grep -rn '@icloud' content/` → niets; rekeningnummer staat er nog.
  - `content/activiteiten/de-talentenfuif-2025-komt-eraan/` bevat `afbeelding.jpg` en `aliassen: ['-de-talentenfuif-2025-komt-eraan']`.
  - Per pagina: elke tekst uit de Builder-pagina (zie spec-tabel) is terug te vinden in het `.md`-bestand. Steekproef met `diff` van platte tekst niet nodig; lees de 6 bestanden.
  - Geen naam van een inactief lid in `content/` (`grep` op de 9 namen uit de lokale `teamlid.json`).

- [ ] **Step 5: Checklist** — `npm run lint && npm run type-check && npm run test:coverage && npm run build` → alles groen.

- [ ] **Step 6: Vink stap 2 af in `CLAUDE.md`** en commit
```bash
git add content scripts/migrate-content __tests__/content package.json CLAUDE.md
git commit -m "feat(content): migrate Builder content to content/"
git push origin revive
```
