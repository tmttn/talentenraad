# Pagina's uit `content/`, Builder eruit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** De publieke site rendert volledig uit `content/` via `app/lib/content`, en alle Builder.io-code, -dependencies en de admin-schermen die content bewerkten zijn weg.

**Architecture:** Serverpagina's lezen content met `content.*` (loader van stap 2) en geven data als props door aan presentationele componenten in `app/features/` en `app/components/ui/`. Vaste routes per pagina; statisch gegenereerd (`generateStaticParams`, geen `revalidate`). Admin houdt alleen inzendingen, gebruikers, audit-logs, feedback en notificaties.

**Tech Stack:** Next.js 16 App Router (server components), TypeScript strict, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-30-contentmodel-design.md` (contentmodel, loader-API) en CLAUDE.md "Revival"-sectie. Beslissing Tom (2026-10-31): admin-schermen die content bewerken + inline-bewerkmodus gaan weg in deze stap; content-wijzigingen tot stap 6 via git.

## Global Constraints

- Bezoekers merken niets: elke huidige route rendert dezelfde teksten, in dezelfde volgorde en met dezelfde componenten als nu (opmaak-props die Builder meegaf — `variant`, `size`, `columns`, `limit`, `showLocation` … — worden vaste waarden in het template, overgenomen uit de Builder-pagina's; zie tabel in Task 3).
- Data komt alleen van `content` uit `@lib/content` (server-side). Geen `fetch` naar `cdn.builder.io` meer, geen `useEffect`-data-ophaling in features.
- Afbeeldingen: `ContentImage` (`src`, `width`, `height`) via `next/image`.
- URL's blijven: `/`, `/kalender`, `/nieuws`, `/contact`, `/over-ons`, `/sponsors`, `/privacybeleid`, `/cookiebeleid`, `/algemene-voorwaarden`, `/activiteiten/<slug>`, `/nieuws/<slug>`. Een `aliassen`-slug geeft `permanentRedirect` naar de echte slug; onbekende slug → `notFound()`.
- Statisch: `generateStaticParams` voor detailroutes; geen `export const revalidate`.
- Database blijft voor gebruikers, inzendingen, audit logs, feedback. Tabellen `sponsors` en `site_settings` blijven in het schema tot stap 5 (Postgres → SQLite), maar niets leest ze nog.
- Tests: elk aangepast feature-component krijgt/behoudt een Vitest-test met props-data (geen fetch-mocks). Tests van verwijderde code gaan mee weg. Coverage ≥ 50% op alle vier (niet verlagen; bij tekort tests toevoegen).
- Checklist per commit: `npm run lint && npm run type-check && npm run test:coverage && npm run build`. Hook, geen `--no-verify`. Commit-types: feat, fix, style, refactor, perf, test, docs, chore.
- Codestijl: 2 spaties, enkele quotes, `??`, `item => …`. Geen XO.
- Repo is publiek: geen persoonsgegevens uit `content-export/` in code/tests.

## Review Focus

1. **Alias-redirect en onbekende slug**: `/activiteiten/-de-talentenfuif-2025-komt-eraan` → 308 naar `/activiteiten/de-talentenfuif-2025-komt-eraan`; `/activiteiten/bestaat-niet` → 404. Test in Task 2.
2. **Lege collecties**: geen nieuws of geen komende activiteiten → het bestaande lege-staat-blok, geen crash. Test in Task 2.
3. **Activiteiten in verleden vs toekomst**: kalender toont komende (datum ≥ vandaag) in de lijst en voorbije in het archief, zoals nu; "vandaag" telt als komend. Bij statische build bepaalt de builddatum dit — aanvaard, nachtelijke rebuild komt in stap 5. Test in Task 2 met vaste datum (`vi.setSystemTime`).
4. **Aankondiging uit**: `aankondiging.actief: false` → geen balk. Test in Task 1.
5. **Externe links in footer/CTA** (`https://…`) openen zoals nu (`target`/`rel` gelijk aan huidig gedrag). Test in Task 1.

---

### Task 1: Layout uit `site.yaml`

**Files:**
- Modify: `app/(main)/layout.tsx`, `app/components/layout/site-header-server.tsx`, `app/components/layout/site-footer-server.tsx`, `app/components/layout/page-with-announcements.tsx`, `app/components/seasonal-decorations-server.tsx`, `app/features/marketing/announcement-banner.tsx` (+ de footer-CTA-component die nu `footer-cta` uit Builder haalt)
- Test: bestaande tests in `__tests__/components/layout/`, `__tests__/components/seasonal-decorations-server.test.tsx`, `__tests__/features/marketing/` aanpassen

**Interfaces:**
- Consumes: `content.getSite(): Site` (`navigatie`, `footer`, `cta`, `decoraties`, `aankondiging`).
- Produces: header/footer/aankondiging/footer-CTA/decoraties renderen uit `getSite()`. `getSeasonalDecorationsConfig()` blijft bestaan (zelfde signatuur) maar leest `site.decoraties`. Admin-edit-mode-wrapper verdwijnt uit `(main)/layout.tsx`.

- [ ] Step 1: Tests aanpassen naar props/`content`-mock (mock `@lib/content` met een vaste `Site`): header toont `navigatie`-links; footer toont adres, e-mail, groepen, sociaal; aankondiging met `actief: false` rendert niets; externe link heeft dezelfde `target`/`rel` als nu.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implementeer. `announcement-banner` wordt presentationeel (props `{tekst, type, link?}`), geen fetch.
- [ ] Step 4: Run → PASS; checklist.
- [ ] Step 5: Commit `feat(content): render layout from site.yaml`.

---

### Task 2: Collecties en detailpagina's

**Files:**
- Modify: `app/features/activities/activities-list.tsx`, `activities-archive.tsx`, `app/features/news/news-list.tsx`, `app/features/team/team-grid.tsx`, `app/features/faq/faq.tsx`, `app/features/dashboard/homepage-dashboard.tsx`, `app/(main)/activiteiten/[slug]/page.tsx`, `app/(main)/nieuws/[slug]/page.tsx`
- Delete: `app/features/activities/calendar-section.tsx`, `app/features/gallery/photo-gallery.tsx` (alleen via Builder-registry gebruikt) + hun tests
- Test: bestaande feature-tests herschrijven; detailpagina-tests

**Interfaces:**
- Consumes: `content.getActiviteiten()`, `getActiviteit(slug)`, `getNieuws()`, `getNieuwsItem(slug)`, `getTeam()`, `getFaq()`, `getSite()`; types `Activiteit`, `NieuwsItem`, `Teamlid`, `FaqItem` uit `@lib/content`.
- Produces (props, alle componenten zonder data-fetching; mogen `'use client'` houden voor interactie):
  - `ActivitiesList({activiteiten: Activiteit[]; limit?: number; showViewAll?: boolean; showLocation?: boolean; showDescription?: boolean})` — toont alleen komende (`datum >= vandaag`, lokale datum `YYYY-MM-DD`)
  - `ActivitiesArchive({activiteiten: Activiteit[]; title: string; subtitle: string; limit?: number; showYear?: boolean})` — alleen voorbije, nieuwste eerst
  - `NewsList({nieuws: NieuwsItem[]; limit?: number})`
  - `TeamGrid({leden: Teamlid[]; columns: 3 | 4; showDescription: boolean})` — filtering op categorie gebeurt door de caller
  - `Faq({items: FaqItem[]})`
  - `HomepageDashboard({activiteiten: Activiteit[]; nieuws: NieuwsItem[]; aankondiging?: …})` — zelfde inhoud als nu, uit props
  - Links naar items gebruiken `item.slug` (niet meer `generateSlug`); alle vijf `generateSlug`-kopieën verdwijnen.
  - Detailpagina's: `generateStaticParams` uit de slugs; `generateMetadata` uit titel/samenvatting; alias → `permanentRedirect(\`/activiteiten/${item.slug}\`)`; geen item → `notFound()`. Body via `item.html`.

- [ ] Step 1: Tests: elk component rendert met fixture-props (zelfde teksten/structuur als huidige tests); `ActivitiesList` met `vi.setSystemTime('2025-03-01')` toont alleen datums ≥ 2025-03-01, `ActivitiesArchive` de rest; lege arrays → lege staat; detailpagina: bestaande slug rendert html, alias redirect (assert `permanentRedirect` aangeroepen met de echte URL), onbekend → `notFound`.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implementeer.
- [ ] Step 4: Run → PASS; checklist.
- [ ] Step 5: Commit `feat(content): collections and detail pages from content`.

---

### Task 3: Paginatemplates

**Files:**
- Create: `app/(main)/kalender/page.tsx`, `nieuws/page.tsx`, `contact/page.tsx`, `over-ons/page.tsx`, `sponsors/page.tsx`, `app/(main)/[tekst]/page.tsx` (tekstpagina's; vervangt `[...page]`)
- Modify: `app/(main)/page.tsx` (home), `app/features/sponsors/sponsor-banner.tsx` (props i.p.v. DB/Builder)
- Delete: `app/(main)/[...page]/page.tsx`
- Test: `__tests__/app/…` per pagina

**Interfaces:**
- Consumes: `content.getPagina(naam)`, `listTeksten()`, `getTekst(slug)` + collecties uit Task 2; componenten `Hero`, `InfoCard`, `CtaBanner`/`UnifiedCta`, `Typography`, `Section`, `ContactForm`, `TeamGrid`, … (zelfde componenten die Builder nu rendert — zie `app/components/builder/` registry voor de mapping naam → component).
- Produces: per pagina een server component met vaste opbouw. Vaste opmaakwaarden (uit de huidige Builder-pagina's):

| Pagina | Opbouw en vaste props |
|---|---|
| `/` | Hero `size=compact` (titel, ondertitel) → h2 `dashboardTitel` + HomepageDashboard → InfoCard `icon=heart variant=pink` (`infokaart.titel`, body) met h2 `faqTitel` + FAQ → UnifiedCta `variant=compact` (cta, 2 knoppen: 1e `white`, 2e `outline`, `showArrow`) |
| `/kalender` | Hero `variant=centered size=small` (titel, ondertitel, h2 `lijst.titel`, body `lijst.ondertitel` muted) + ActivitiesList `limit=20 showViewAll=false showLocation showDescription` → ActivitiesArchive (`archief.*`, `limit=20 showYear`) → CTABanner `variant=accent` (knop `white size=md showArrow`) |
| `/nieuws` | Hero `variant=centered size=small` + NewsList `limit=10` → CTABanner `variant=accent` |
| `/contact` | Hero `variant=centered size=small` (+ h2 `formulier.titel`, body muted `formulier.tekst`) + ContactForm `showPhone=false showSubject` → InfoCard `icon=email variant=default` (`infokaart.titel`, body) |
| `/over-ons` | Hero `variant=centered size=medium` → InfoCard `icon=heart variant=green` (`infokaart.titel`, body) met h2 `bestuur.titel` + muted `bestuur.tekst` + TeamGrid(bestuur) `columns=3 showDescription` + h2 `leden.titel` + muted `leden.tekst` + TeamGrid(lid) `columns=4 showDescription=false` → CTABanner `variant=accent` |
| `/sponsors` | Hero `size=small` → 4 Sections (goud/zilver/brons/partner; afwisselend `white`/`light`, `size=large`) met kop "Gouden Sponsors"/"Zilveren Sponsors"/"Bronzen Sponsors"/"Partners" en de sponsors van dat niveau of `legeTekst[niveau]` → UnifiedCta `variant=full` (cta) |
| `/<tekst>` | Box/prose met `titel` als h1 en `html`; `generateStaticParams` uit `listTeksten()`; onbekend → `notFound()` |

  Elke pagina: `generateMetadata` → `{title: titel, description: beschrijving}`. Sitebrede footer-CTA blijft via layout (Task 1).

- [ ] Step 1: Tests per pagina (mock `@lib/content` met vaste data): alle frontmatter-teksten van die pagina staan in de render, in de volgorde van de tabel; knoppen linken naar `cta.knoppen[].link`; sponsors-niveau zonder sponsors toont `legeTekst`; onbekende tekst-slug → `notFound`.
- [ ] Step 2: Run → FAIL.
- [ ] Step 3: Implementeer. Vergelijk visueel met de huidige Builder-rendering via de props in de tabel; geen nieuwe UI.
- [ ] Step 4: Run → PASS; checklist; `npm run build` toont alle routes als statisch (○/●).
- [ ] Step 5: Commit `feat(content): page templates from content`.

---

### Task 4: Builder en content-admin verwijderen

**Files:**
- Delete: `app/components/builder/**`, `app/(builder-preview)/**`, `app/lib/builder-utils.tsx`, `app/lib/builder-admin.ts`, `app/lib/builder-types.ts`, `app/lib/data-export.ts`; admin-routes `app/(admin)/admin/(protected)/{activiteiten,nieuws,paginas,aankondigingen,sponsors,seo,decoraties,data}/**`; API-routes `app/api/admin/{builder,content,data,assets,settings}/**`, `app/api/sponsors/track/**`; `scripts/*builder*`, `scripts/export-builder-content.mjs`, `scripts/migrate-content/**` (+ `migrate:content`-script in package.json, `turndown*` en `tsx` devDeps als niets anders ze gebruikt); bijhorende tests
- Modify: `app/features/admin/admin-sidebar.tsx` (menu-items weg), `app/(admin)/admin/(protected)/page.tsx` (dashboard-tegels naar verwijderde schermen weg), `proxy.ts` (`checkBuilderContent` weg; 404-afhandeling via Next `notFound`), `next.config.js` (`cdn.builder.io` remotePattern weg), `package.json` (`@builder.io/*` weg), `jest`-restanten n.v.t., `.env`-voorbeelden en CLAUDE.md (Builder-secties weg, "Project Structure" bijwerken, stap 3 afvinken, open punten — zie Step 4)
- Test: suite groen, coverage ≥ 50%

**Interfaces:**
- Consumes: Tasks 1–3 hebben alle publieke Builder-afhankelijkheden vervangen.
- Produces: `grep -rniE "builder" app scripts proxy.ts next.config.js package.json` geeft niets meer (behalve eventuele woorden in commentaar die niet over Builder.io gaan).

- [ ] Step 1: Verwijder; los type-/importfouten op door verwijzingen weg te halen, niet door stubs.
- [ ] Step 2: `npm run test:coverage`; bij < 50% tests toevoegen voor overgebleven code (geen drempel verlagen).
- [ ] Step 3: Checklist.
- [ ] Step 4: CLAUDE.md: Builder-secties en `(builder-preview)` weg; stap 3 `[x]`; onder het stappenplan een korte lijst "Open punten" toevoegen met: alias-uniciteit in `content.test.ts`; relatieve afbeeldingen in Markdown-body; `concept` op pagina's genegeerd; gecachte arrays by reference (stap 3/6) · `copy-content-assets` is-main via realpath, Node ≥ 20.12 vastleggen, `content/` in standalone-trace (stap 5) · `z.strictObject`, `min(1)` op verplichte strings, link-validatie, editor schrijft alleen `100644`-blobs (stap 6) · `tsconfig.json` exclude bevat nog `jest.*` (Tom).
- [ ] Step 5: Commit `chore: remove Builder.io and content admin`.

---

### Task 5: End-to-end-controle

**Files:**
- Modify: geen code, tenzij de controle een fout vindt (dan fixen + test).

- [ ] Step 1: `npm run build && npm run start` (poort vrij kiezen), dan voor elke URL uit Global Constraints: HTTP 200 (of 308 voor de alias), en de `<title>` + één kenmerkende tekst uit het bijhorende `content/`-bestand staat in de HTML (`curl`). `/bestaat-niet` → 404. Afbeelding van de Talentenfuif laadt (200 op `/content/activiteiten/…/afbeelding.jpg` en via `/_next/image`).
- [ ] Step 2: Rapporteer per URL status + gevonden tekst (tabel). Fouten → fixen met test, checklist, commit `fix(content): …`.
