# Claude Code Project Rules

## Revival (sinds oktober 2026) — LEES DIT EERST

De site wordt herbouwd met zo weinig mogelijk SaaS-afhankelijkheden, zodat Claude er zelfstandig mee kan werken. Beslissingen (genomen door Tom):

- **Hosting:** Docker-container op een kleine VPS (bv. Hetzner) met Caddy voor HTTPS. Geen Vercel-specifieke features meer (geen `@vercel/*`, Edge Config, Vercel Cron).
- **Content:** Markdown met frontmatter **in deze repo** (`content/`), plus een lichte editor in de admin die via de GitHub API commits maakt, zodat niet-technische ouders kunnen redigeren zonder GitHub-account.
- **Weg:** Builder.io, Hypertune/feature flags, Sentry, Vercel Analytics/Speed Insights, push-notificaties en claps, SonarCloud. Ook Auth0 (→ magic-link login per e-mail) en Resend (→ gewone SMTP).
- **Database:** alleen nog voor gebruikers, inzendingen, audit logs en feedback; doel is SQLite via Drizzle.
- **Design systeem:** "Talentenraad Beverst" op claude.ai (Design System-artifact): tokens, merkboek en de UI-componenten uit `app/components/ui/`. Lees het README daarvan vóór je UI bouwt; nieuwe componenten volgen die tokens. `color-accent` haalt maar 3,6:1 op wit: gebruik `color-accent-hover` voor kleine tekst.

### Stappenplan
1. [x] Builder.io-content exporteren: `node scripts/export-builder-content.mjs` (keys in `.env.local`) → `content-export/`. **Alleen lokaal, niet committen**: bevat persoonsgegevens en de repo is publiek. Content freeze in Builder tot stap 3.
2. [x] Contentmodel in `content/` (Markdown + frontmatter) en migratiescript vanuit `content-export/`.
3. [ ] Pagina's lezen uit `content/` i.p.v. Builder.io; Builder-code en `scripts/*builder*` verwijderen.
4. [ ] Auth0 → magic links; Resend → SMTP; flags, Sentry, push, claps, Vercel-pakketten eruit.
5. [ ] Postgres → SQLite; `Dockerfile` + `compose.yaml` (app + Caddy); deploy via GitHub Actions.
6. [ ] Admin-editor die content als commits wegschrijft.

Tot stap 3 klaar is, gelden de Builder.io-secties hieronder nog voor de bestaande code; daarna mogen ze weg.

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
- `app/(builder-preview)/` - Isolated Builder.io preview pages (no header/footer)
- `__tests__/` - Vitest test files mirroring app structure

## After Refactoring

When moving files or creating route groups:
1. Update ALL related test import paths
2. Update vitest.config.mts coverage exclusions (escape parentheses)
3. Run full test suite before committing

## Builder.io API Usage

### API Keys
- **Public API Key**: `NEXT_PUBLIC_BUILDER_API_KEY` - For reading content (CDN)
- **Private Write Key**: `BUILDER_PRIVATE_KEY` - For writing/updating content (starts with `bpk-`)

### Read API (CDN)
Use the CDN endpoint for reading published content:
```bash
# List content entries
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&limit=10"

# Get single entry by ID
curl "https://cdn.builder.io/api/v3/content/{model}/{entryId}?apiKey={PUBLIC_KEY}"

# Query by field (e.g., URL)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&query.data.url=/"

# Filter by date (use $gte, $lte, $gt, $lt)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&query.data.datum.\$gte=2025-01-01"

# Bypass CDN cache (for debugging only)
curl "https://cdn.builder.io/api/v3/content/{model}?apiKey={PUBLIC_KEY}&noCache=true"
```

### Write API
Use the Write API to create or update content:
```bash
# Create new entry (POST)
curl -X POST "https://builder.io/api/v1/write/{model}" \
  -H "Authorization: Bearer {PRIVATE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"data": {"blocks": [...]}}'

# Update existing entry by ID (PUT)
curl -X PUT "https://builder.io/api/v1/write/{model}/{entryId}" \
  -H "Authorization: Bearer {PRIVATE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"data": {"blocks": [...]}}'
```

### Important Notes
1. **Always find entry ID first** before updating - use Read API to get the ID
2. **CDN caching**: Changes may take 1-5 minutes to propagate on CDN
3. **Use `noCache=true`** to verify updates immediately (debugging only)
4. **POST creates new entries**, PUT updates existing ones
5. **Query uses `$eq`, `$gte`, `$lte`** - escape the `$` in bash with `\$`

### Builder.io Models
When creating Builder.io models:
- Use v2 admin API (`https://builder.io/api/v2/admin`), NOT v1 graphql
- Always add `@type: '@builder.io/core:Field'` to field definitions
- Always verify the model exists after creation by listing models
- Include `helperText` (description) for all models and fields

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
5. Assuming Builder.io models exist without verifying
6. Forgetting helperText/description on Builder.io models
7. Modifying test/linter configuration to bypass failing checks
