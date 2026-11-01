# Content-editor (stap 6) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Niet-technische ouders bewerken in de admin activiteiten, nieuws (met foto), teamleden, FAQ en de aankondiging; elke opslag wordt één commit op `main` via de GitHub API en staat na de automatische deploy (±3 min) online.

**Architecture:** Server-side “content store” (`app/lib/content-store/`) leest bestanden van `main` via de GitHub REST API en schrijft een wijziging als één atomaire commit (Git Data API: blobs → tree → commit → ref-update met de verwachte parent). Elke wijziging wordt vóór de commit gevalideerd met dezelfde zod-schema's als de build (`app/lib/content/schemas.ts`). Formulieren in de admin onder `/admin/content/…`, alleen voor ingelogde gebruikers met rol `admin` of `redacteur`. Foto's worden op de server met `sharp` verkleind en ontdaan van metadata.

**Tech Stack:** Next.js 16 (server actions of route handlers), GitHub REST API via `fetch` (geen SDK), sharp, gray-matter + js-yaml (CORE_SCHEMA), zod, Vitest.

**Spec:** CLAUDE.md Revival ("lichte editor in de admin die via de GitHub API commits maakt, zodat niet-technische ouders kunnen redigeren zonder GitHub-account") + Open punten (editor schrijft alleen `100644`-blobs; `z.strictObject`, `min(1)`, link-validatie). Tom (2026-11-01): "begin maar meteen en doe wat je goed dunkt". Keuzes Claude: zie Global Constraints.

## Global Constraints

- **Rollen:** `users.role` ∈ `admin` | `redacteur` (nieuwe migratie; bestaande rijen met `is_admin = 1` → `admin`, anders `redacteur`; `ADMIN_EMAILS` blijft altijd `admin`). Inloggen mag voor beide rollen. Content bewerken: beide. Gebruikersbeheer, audit logs: alleen `admin`. Elke admin-pagina en API-route controleert de rol server-side (zelfde patroon als `requireAdminSession()`).
- **Publiceren:** opslaan = meteen een commit op `main` (geen goedkeuring), commitbericht `content: <actie> <type> "<titel>"` met trailer `Bewerkt-door: <naam of e-mail>`; author/committer `Talentenraad-editor <noreply@talentenraad.be>`. Na opslaan toont de UI "Opgeslagen. Je wijziging staat over ongeveer 3 minuten online." en de status van de laatste deploy (GitHub Actions-run van `deploy.yml` op `main`: bezig / klaar / mislukt).
- **GitHub-toegang:** env `GITHUB_CONTENT_TOKEN` (fine-grained PAT van Tom: alleen repo `tmttn/talentenraad`, `contents: read & write`, `actions: read`), `GITHUB_REPO=tmttn/talentenraad`, `GITHUB_BRANCH=main`. Ontbreekt de token → editor toont "Bewerken is nog niet ingesteld" en schrijft niets; de rest van de site werkt. De token komt nooit in logs, fouten of de client.
- **Paden:** de store schrijft alleen onder `content/` in de toegelaten collecties (`activiteiten/<slug>/`, `nieuws/<slug>/`, `team/<slug>/`, `faq/<slug>.md`) en `content/site.yaml`; alleen gewone bestanden (mode `100644`), nooit symlinks, submodules of uitvoerbare bestanden; geen `..`, absolute paden of andere mappen. Slugs via `slugify()`; een nieuwe slug die al bestaat (of een alias is) → fout "Er bestaat al een item met deze titel".
- **Validatie:** elke wijziging wordt vóór de commit geparsed met het bestaande schema van dat type; fout → Nederlandse melding per veld, niets gecommit. Verplichte strings `min(1)`; links `/…`, `https://…` of `mailto:` (geen `javascript:`). Schema-wijzigingen mogen bestaande `content/` niet ongeldig maken (`__tests__/content/content.test.ts` blijft groen).
- **Conflicten:** de editor laadt een item met de blob-SHA's van de bestanden; bij opslaan moet de huidige SHA op `main` gelijk zijn, anders "Iemand anders heeft dit net aangepast. Herlaad de pagina." en niets gecommit. Ref-update is fast-forward-only; faalt die (iemand anders committe net) → één automatische nieuwe poging op de nieuwe `main`, daarna dezelfde melding.
- **Foto's:** jpg/png/webp, max 10 MB, gecontroleerd op inhoud (sharp metadata), niet op extensie; resultaat: max 1600 px langste zijde, JPEG kwaliteit 82, alle metadata (EXIF/GPS) eruit, bestandsnaam `afbeelding.jpg` (teamlid `foto.jpg`); vervangen of verwijderen kan.
- **Markdown:** tekstvak met een live voorbeeld ernaast (rendering met dezelfde `renderMarkdown` als de site, via een server-route); korte hulp ("**vet**, *schuin*, - lijst, [link](https://…)").
- **Verwijderen:** mag voor beide rollen, met een bevestigingsstap in de pagina zelf; verwijdert de hele itemmap in één commit.
- **Audit log:** elke opslag/verwijdering → `logAudit` (actie `content.create|update|delete`, type, slug, commit-SHA).
- **UI:** volg het design system "Talentenraad Beverst": Nederlands (Vlaams), je/jij; koppen in zinsbouw; knoplabels zijn werkwoorden ("Opslaan", "Activiteit toevoegen", "Verwijderen"); geen emoji; elk veld in `FormField` met label (placeholder is nooit een label); componenten uit `app/components/ui/` (Input, Textarea, Select, Switch, Checkbox, FormField, Card, Typography, buttons) en de bestaande admin-stijl; `color-primary` voor primaire knoppen, fouten `color-red-600`; Lucide-iconen 16/20 px; zichtbare focusring. Datums `nl-BE`.
- **Checklist per commit:** `npm run lint && npm run type-check && npm run test:coverage && npm run build`; hook, geen `--no-verify`; commits SSH-ondertekend (bij falen: gestaged laten, BLOCKED). Types: feat, fix, style, refactor, perf, test, docs, chore, deploy, enhance. Codestijl van de repo; geen XO; coverage ≥ 50%. Niet aan `vitest.config.mts`, `eslint.config.mjs`, `tsconfig.json`.
- **Repo is publiek:** geen persoonsgegevens of tokens in code of tests.

## Review Focus

1. **Redacteur probeert gebruikersbeheer** (pagina of API) → geweigerd (redirect / 403). Test in Task 1.
2. **Pad buiten de toegelaten mappen** of een slug met `../` → geweigerd vóór er iets naar GitHub gaat. Test in Task 2.
3. **Twee mensen bewerken hetzelfde item** → de tweede krijgt de conflictmelding, niets overschreven. Test in Task 2.
4. **Ongeldige invoer** (lege titel, datum 2025-02-30, `javascript:`-link) → veldfout, geen commit. Test in Task 3.
5. **Foto met GPS-EXIF** → opgeslagen bestand heeft geen EXIF; een `.jpg` die eigenlijk tekst is → geweigerd. Test in Task 3.

---

### Task 1: Rollen

**Files:** `app/lib/db/schema.ts` (+ migratie in `drizzle/`), `app/lib/auth/admin.ts` (→ `getUserRole`, `canLogin`), `app/lib/auth/session.ts` (rol in sessie-resultaat), `app/lib/auth/require-admin.ts` (+ `requireEditorSession()`, `requireAdminSession()` eist rol admin), login-route (`canLogin` i.p.v. `verifyAdmin`), admin-layout/sidebar (menu per rol), gebruikersbeheer (rol kiezen bij uitnodigen/bewerken; API-routes admin-only), tests.

**Interfaces:** `type Role = 'admin' | 'redacteur'`; `getSession(): Promise<{user: {id, email, name, role}} | undefined>`; `requireEditorSession()` (admin of redacteur), `requireAdminSession()` (alleen admin).

- [ ] Tests: migratie zet bestaande admins op `admin`; redacteur kan inloggen; redacteur → `/admin/gebruikers` redirect, users-API 403; admin alles; `ADMIN_EMAILS` altijd admin.
- [ ] Implementeren; checklist; commit `feat: editor role`.

### Task 2: GitHub content store

**Files:** Create `app/lib/content-store/github.ts` (HTTP-laag), `app/lib/content-store/store.ts` (`readItem`, `listItems`, `commitChanges`), `app/lib/content-store/paths.ts` (pad-whitelist), tests met een nagebootste GitHub API (fetch-mock die de API-calls en hun volgorde controleert).

**Interfaces:**
- `readFile(path): Promise<{text: string; sha: string} | undefined>`, `listDir(path): Promise<{name; path; type; sha}[]>` (van `GITHUB_BRANCH`).
- `commitChanges({message, author, changes: {path, content?: Buffer | string, delete?: true, expectedSha?: string | null}[]}): Promise<{commitSha: string}>` — één commit; `expectedSha: null` = bestand mag nog niet bestaan; mismatch → `ConflictError`; ref-update fast-forward-only met één retry.
- `assertAllowedPath(path)` gooit bij alles buiten de whitelist.
- `latestDeployStatus(): Promise<{state: 'bezig' | 'klaar' | 'mislukt' | 'onbekend'; startedAt?: string}>`.
- `isEditingConfigured(): boolean`.

- [ ] Tests (Review Focus 2, 3): whitelist; conflict bij gewijzigde SHA; bestand bestaat al bij `expectedSha: null`; één retry bij non-fast-forward; blobs altijd mode `100644`; token nooit in foutmeldingen; ontbrekende token → `isEditingConfigured() === false`.
- [ ] Implementeren; checklist; commit `feat: GitHub content store`.

### Task 3: Serialisatie, validatie en foto's

**Files:** `app/lib/content-store/serialize.ts` (frontmatter + body → Markdown met gray-matter + js-yaml CORE_SCHEMA, stabiele veldvolgorde; `site.yaml` aankondiging bijwerken met behoud van de rest), `app/lib/content-store/images.ts` (sharp), `app/lib/content/schemas.ts` (`min(1)`, link-validatie; strict objects alleen waar de bestaande content geldig blijft), tests.

**Interfaces:** `serializeEntry(type, frontmatter, body): string`; `parseEntryForm(type, formData): {ok: true, frontmatter, body} | {ok: false, errors: Record<string, string>}`; `processImage(file: Buffer): Promise<{data: Buffer; ext: 'jpg'}>` (gooit `ImageError` met NL-melding).

- [ ] Tests (Review Focus 4, 5): round-trip van elk bestaand `content/`-bestand (lezen → serialiseren → opnieuw lezen = gelijk); veldfouten; EXIF/GPS weg (fixture gemaakt met sharp `withMetadata`); nep-jpg geweigerd; >10 MB geweigerd; resize.
- [ ] Implementeren; checklist; commit `feat: content serialization and image processing`.

### Task 4: Editor-UI

**Files:** `app/(admin)/admin/(protected)/content/page.tsx` (overzicht per type), `…/content/[type]/page.tsx` (lijst + "toevoegen"), `…/content/[type]/[slug]/page.tsx` en `…/content/[type]/nieuw/page.tsx` (formulier), `…/content/aankondiging/page.tsx`, server actions in `…/content/actions.ts`, `app/api/admin/content/preview/route.ts` (Markdown-voorbeeld), sidebar-item "Content", deploy-statuscomponent, tests.

**Interfaces:** types `activiteiten`, `nieuws`, `team`, `faq`; velden volgen de schema's (activiteit: titel, datum, tijd, locatie, categorie, samenvatting, afbeelding, inhoud, concept; nieuws: titel, datum, samenvatting, afbeelding, inhoud, concept; teamlid: naam, rol, categorie, volgorde, foto, beschrijving; faq: vraag, antwoord, volgorde; aankondiging: actief, tekst, type, link, linkTekst). Lijsten lezen van GitHub (`main`), zodat net opgeslagen wijzigingen zichtbaar zijn vóór de deploy klaar is.

- [ ] Tests: formulier toont veldfouten; opslaan roept `commitChanges` met de juiste paden en inhoud; verwijderen vraagt eerst bevestiging; editor niet ingesteld → melding, geen formulier; redacteur ziet "Content" maar niet "Gebruikers".
- [ ] Implementeren; checklist; commit `feat: content editor`.

### Task 5: Afronden en inrichten

**Files:** `.env.example` (GITHUB_*), `deploy/README.md` (token aanmaken: fine-grained, rechten, vervaldatum; in `.env` zetten), CLAUDE.md (stap 6 `[x]` na ingebruikname, Open punten bijwerken), handleiding voor ouders `docs/handleiding-editor.md` (kort, Nederlands, met wat er na opslaan gebeurt).

- [ ] Checklist; commit `docs: content editor`.
- [ ] (Controller, met Tom) PAT aanmaken door Tom, in `/opt/talentenraad/.env` zetten door Tom, deploy, end-to-end: activiteit aanmaken met foto → commit op `main` → deploy → zichtbaar op de site → verwijderen.
