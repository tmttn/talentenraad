# Claude Code Project Rules

## Revival (sinds oktober 2026) — LEES DIT EERST

De site wordt herbouwd met zo weinig mogelijk SaaS-afhankelijkheden, zodat Claude er zelfstandig mee kan werken. Beslissingen (genomen door Tom):

- **Hosting:** Docker-container op een kleine VPS (bv. Hetzner) met Caddy voor HTTPS. Geen Vercel-specifieke features meer (geen `@vercel/*`, Edge Config, Vercel Cron).
- **Content:** Markdown met frontmatter **in deze repo** (`content/`), plus een lichte editor in de admin die via de GitHub API commits maakt, zodat niet-technische ouders kunnen redigeren zonder GitHub-account.
- **Weg:** Builder.io, Hypertune/feature flags, Sentry, Vercel Analytics/Speed Insights, push-notificaties en claps, SonarCloud. Ook Auth0 (→ magic-link login per e-mail) en Resend (→ gewone SMTP).
- **Database:** alleen nog voor gebruikers, inzendingen, audit logs en feedback; doel is SQLite via Drizzle.
- **Design systeem:** "Talentenraad Beverst" op claude.ai (Design System-artifact): tokens, merkboek en de UI-componenten uit `app/components/ui/`. Lees het README daarvan vóór je UI bouwt; nieuwe componenten volgen die tokens. `color-accent` haalt maar 3,6:1 op wit: gebruik `color-accent-hover` voor kleine tekst.

### Stappenplan
1. [x] Builder.io-content exporteren: `scripts/export-builder-content.mjs` (sinds stap 3 verwijderd; staat in de git-historie) → `content-export/`. **Alleen lokaal, niet committen**: bevat persoonsgegevens en de repo is publiek. Content freeze in Builder tot stap 3.
2. [x] Contentmodel in `content/` (Markdown + frontmatter) en migratiescript vanuit `content-export/`.
3. [x] Pagina's lezen uit `content/` i.p.v. Builder.io; Builder-code en `scripts/*builder*` verwijderen.
4. [x] Auth0 → magic links; Resend → SMTP; flags, Sentry, push, claps, Vercel-pakketten eruit.
5. [x] Postgres → SQLite; `Dockerfile` + `compose.yaml` (app + Caddy); deploy via GitHub Actions. Live sinds 31 oktober 2026 op Hetzner (`cax11`, fsn1, 49.13.27.240); zie `deploy/README.md`.
6. [ ] Admin-editor die content als commits wegschrijft: `/admin/content` (activiteiten, nieuws, team, faq, aankondiging), rollen `admin`/`redacteur`, commits via de GitHub API (`app/lib/content-store/`, token `GITHUB_CONTENT_TOKEN`, zie `deploy/README.md`). Handleiding voor ouders: `docs/handleiding-editor.md`. Commitberichten bevatten geen naam of e-mail van de redacteur (publieke repo); de audit log koppelt commit en gebruiker.

### Hosting
- Hetzner Cloud-server, uitrol in `/opt/talentenraad` (Docker Compose: app + Caddy). Secrets staan alleen in `/opt/talentenraad/.env` op de server.
- Deploy via GitHub Actions bij een push naar `main` en elke nacht (herbouw). Zie `deploy/README.md`.
- Database: SQLite in `/data/talentenraad.db` (container), lokaal `./data/`.

### Open punten
- Alias-uniciteit controleren in `content.test.ts`.
- Relatieve afbeeldingen in de Markdown-body worden nog niet afgehandeld.
- `concept` op pagina's wordt genegeerd.
- Gecachte arrays worden by reference teruggegeven (stap 3/6).
- `copy-content-assets`: is-main via realpath; Node ≥ 20.12 vastleggen; `content/` in de standalone-trace opnemen.
- Mail-linkscanners (bv. Outlook SafeLinks) kunnen het eenmalige login-token opgebruiken; overweeg later een bevestigingspagina vóór het verbruiken.
- `vitest.config.mts`: commentaar verwijst nog naar Auth0-sessies; `app/features/admin/**` kan terug in coverage (beschermd bestand, toestemming Tom).
- Schema's: `z.strictObject`, `min(1)` op verplichte strings.
- Editor: pagina's en juridische teksten zijn nog niet bewerkbaar; een expliciete status 'uitgeschakeld' voor gebruikers ontbreekt (intrekken = gebruiker verwijderen).
- Editor: tree-entries van GitHub worden niet op vorm gecontroleerd; fast-forward-detectie leunt op de foutmelding van GitHub (faalt veilig); de recursieve tree wordt per commit voor de hele repo opgehaald.
- Editor: de eerste opslag van een bestaand item normaliseert de YAML (aanhalingstekens, emoji-escapes, lege `aliassen`) en geeft dus een grotere diff; verwijderen faalt met een melding als een itemmap een bestand buiten de whitelist bevat.
- Gebruikers-API: dubbele e-mail alleen exact (hoofdlettergevoelig) gecontroleerd; een admin kan zichzelf degraderen.

## Pre-commit Checklist (MANDATORY)

Before ANY commit, ALWAYS run these commands and fix all issues:

```bash
npm run lint        # ESLint (eslint-config-next) - 0 errors
npm run type-check  # tsc --noEmit - 0 errors
npm test            # Vitest tests - all must pass
npm run build       # Next.js build - must succeed
```

De husky pre-commit hook draait lint, type-check en tests met coverage; de build draait in CI.

Do NOT commit if any of these fail. Fix all issues first.

## Workflow

After completing a working unit of code:
1. Run the pre-commit checklist (linter, tests, build)
2. Commit the changes with a descriptive message
3. Push to origin

Always commit and push after finishing a task, don't wait for the user to ask.

## Linting en codestijl

XO is eruit (oktober 2026): de stijlregels gaven duizenden meldingen zonder bugs te vangen. ESLint draait alleen `eslint-config-next` (core-web-vitals + typescript): React hooks, Next.js en TypeScript-fouten. Types bewaakt `tsc` in strict mode.

Niet afgedwongen, wel de stijl van de bestaande code; volg die:

- `item => item.id`, geen haakjes rond een enkele arrow-parameter
- `value ?? fallback` i.p.v. `value || fallback`
- API-responses typen met `as TypeName`, geen `any`
- camelCase-variabelen, enkele quotes, 2 spaties

## Vitest Configuration

- **Escape special chars in glob patterns**: Route groups like `(main)` must be escaped as `\\(main\\)` in vitest.config.mts (also applies to `coverage.exclude`)
- **Update test imports after moving files**: When files move to route groups, update all test import paths

## Project Structure

- `app/(main)/` - Main site pages with header/footer layout
- `__tests__/` - Vitest test files mirroring app structure

## After Refactoring

When moving files or creating route groups:
1. Update ALL related test import paths
2. Update vitest.config.mts coverage exclusions (escape parentheses)
3. Run full test suite before committing

## Configuration Restrictions (CRITICAL)

**DO NOT modify the following files without explicit user permission:**

- `vitest.config.mts` - Test configuration including coverage thresholds
- `eslint.config.mjs` - ESLint configuration
- `tsconfig.json` - TypeScript configuration

**Coverage thresholds are set to 50% and must NOT be lowered.** If tests fail due to coverage:
1. Write additional tests to increase coverage
2. Do NOT reduce the threshold values
3. Ask the user for guidance if coverage cannot be reasonably achieved

This rule exists to maintain code quality standards. Circumventing these rules by modifying configuration is strictly prohibited.

## Common Mistakes to Avoid

1. Committing without running linter first
2. Forgetting to update test imports after moving files
3. Using `||` instead of `??` for optional values
4. Not escaping `()` in Vitest glob patterns
5. Modifying test/linter configuration to bypass failing checks
