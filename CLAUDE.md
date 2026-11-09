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
6. [x] Admin-editor die content als commits wegschrijft (live sinds 1 november 2026): `/admin/content` (activiteiten, nieuws, team, faq, aankondiging), rollen `admin`/`redacteur`, commits via de GitHub API (`app/lib/content-store/`, token `GITHUB_CONTENT_TOKEN`, zie `deploy/README.md`). Handleiding voor ouders: `docs/handleiding-editor.md`. Commitberichten bevatten geen naam of e-mail van de redacteur (publieke repo); de audit log koppelt commit en gebruiker.

7. [x] Bestelsysteem fase 1 (spec "Bestelsysteem voor acties" op claude.ai, plan `docs/superpowers/plans/2026-11-05-bestelsysteem.md`): acties in `content/acties/` + editor (PR #822), bestellen, mails, QR en `/b/[token]` (PR #823), beheer `/admin/bestellingen` + vinkje `bankToegang` + bewaartermijn (PR #825), rol `helper` en afhaal-app `/admin/afhalen` met scanner (PR 4). Design system heeft een paragraaf Bestelsysteem en de kaarten AantalKiezer, StatusPil, Betaalblok en Afgifte. Daarna: rekeningnummer per actie in plaats van in `site.yaml` (PR 5). Nog open: scannen op een echte iPhone en Android-telefoon proberen. Fase 2 (plan `docs/superpowers/plans/2026-11-08-bestelsysteem-fase-2.md`): afhaallijst printen (PR 6), herinneringsmails (PR 7), daarna handmatige bestellingen, gedeeltelijke afgifte, bankafschrift inlezen (`betaalbron: bank`) en een offline reserve; die vier wachten op beslissingen (Open vragen in het plan). Fase 3, online betalen (`betaalbron: online`), is voorlopig niet gepland.

### Bestelsysteem
- Code in `app/lib/bestellingen/`; tabellen `orders`, `order_lines`. Bedragen altijd in cent. Statussen: `wacht`, `betaald`, `afgehaald`, `geannuleerd`, `terugbetalen` (terugbetaald = `geannuleerd` + `terugbetaaldOp`).
- Rekeningnummer **per actie** (`betalen.rekening`: `iban` + `begunstigde`, verplicht, IBAN met mod-97-controle), in de editor in te vullen; `site.yaml` heeft er geen meer. Een actie met het **voorbeeldnummer** `BE68 5390 0754 7034` opent niet in productie (`kanBestellen`, reden `voorbeeldrekening`); het beheer toont dan een waarschuwing met een link naar de actie. De concept-actie `pizzaverkoop-2027` heeft nog het voorbeeldnummer (in een oude activiteit staat `BE62 7340 6932 1461`, niet gecontroleerd).
- QR-codes uit een eigen encoder (`qr-encoder.ts`, byte-modus, niveau M, versie 1–10), geen dependency.
- Betalingen bevestigen alleen met `users.bankToegang` (server-side, `rechten.ts`), los van de rol.
- Persoonsgegevens van bestellingen worden 3 maanden na het laatste afhaalmoment gewist (`bewaartermijn.ts`, dagelijks via `instrumentation.ts`).
- Lokaal testen: een actie met `concept: true` en datums rond vandaag; zonder `SMTP_HOST` staan mails in de console. Zet `SITE_URL` op de poort van de dev-server, anders wijst de inloglink naar `localhost:3000`.
- Afhaal-app `/admin/afhalen` (zachte stijl, telefoonformaat, eigen manifest `public/afhalen.webmanifest`): kies actie en moment → scanner `/<actie>/<moment>` → afgifte `/<actie>/<moment>/<token>` (`app/features/afhalen/`, logica in `afhalen.ts` en `afgifte.ts`). `geefMee` is één voorwaardelijke update (`WHERE status = 'betaald'`): de tweede helper ziet "Al afgehaald om … door …". Een ander afhaalmoment geeft een waarschuwing maar mag mee; niet betaald, al afgehaald en geannuleerd niet. Cash ontvangen alleen met `bankToegang`.
- Rol `helper`: alleen de afhaal-app (`requireStaffSession`); `requireEditorSession` stuurt een helper naar `/admin/afhalen`, `guardEditorApi` geeft 403, inloggen landt op `/admin/afhalen` en de sessie duurt 1 dag (anderen 7). Een helper ziet naam, kind, producten, notitie en het open bedrag van de gescande bestelling, nooit e-mail of telefoon; zoeken in de app gaat niet op e-mail.
- Scanner: `BarcodeDetector` waar die bestaat, anders `jsqr` (dynamische import, frame verkleind tot 640px). Alleen `/b/<token>` van de eigen site opent iets (`leesTokenUitQr`). De camera mag alleen onder `/admin/afhalen` (`Permissions-Policy: camera=(self)` in `next.config.js`, de laatste regel wint); elders `camera=()`. Een test leest onze eigen QR-codes terug met jsQR.
- Camera-app van de telefoon: `/b/<token>` stuurt een ingelogde helper naar het afgiftescherm, een beheerder of redacteur alleen als die telefoon in de afgelopen dag een moment koos (cookie `tr_afhaalmoment`); `?ouder=1` toont de pagina zoals de ouder ze ziet. Een iPhone-app op het beginscherm heeft andere cookies dan Safari: scan daar dus in de app zelf.
- Herinneringsmails (`herinneringen.ts`, elk uur via `instrumentation.ts`, alleen 9–20 u Belgische tijd): betalen de dag vóór de uiterste betaaldatum of op die dag (status `wacht`, besteld vóór vandaag), afhalen de dag vóór het afhaalmoment (status `betaald`, met QR-PNG, niet als de afhaalcode diezelfde dag vertrok). Hoogstens één keer: `betaalHerinneringOp` / `afhaalHerinneringOp` worden pas ná een gelukte verzending gezet, een mislukte mail volgt de volgende ronde. Het beheer toont wanneer ze vertrokken.
- Afhaallijst `/admin/bestellingen/<actie>/afhaallijst` (`afhaallijst()` in `overzicht.ts`): per afhaalmoment op naam, elk moment op een nieuwe pagina, `?moment=` voor één moment. Zonder e-mail, telefoon of bedragen (ligt op de afhaaltafel): alleen "Niet betaald".
- Drizzle laat in een select op één tabel de tabelnamen weg in velden met een `sql`-template: een gecorreleerde subquery (`order_id = id`) vergelijkt dan met de verkeerde kolom. Gebruik een join met `groupBy`.

### Hosting
- Hetzner Cloud-server, uitrol in `/opt/talentenraad` (Docker Compose: app + Caddy). Secrets staan alleen in `/opt/talentenraad/.env` op de server.
- Deploy via GitHub Actions bij een push naar `main` en elke nacht (herbouw). Zie `deploy/README.md`.
- Database: SQLite in `/data/talentenraad.db` (container), lokaal `./data/`.
- Elke opslag in de editor is een deploy. Daarom: GitHub-secret `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` (via een BuildKit-secret in de `Dockerfile`) houdt de Server Action-ID's gelijk tussen builds, anders geeft een pagina van vóór de deploy 409 "Server Action was not found"; Caddy wacht tot 30 s op de herstartende app (`lb_try_duration`) i.p.v. 502; de editorformulieren vangen een mislukte request op (`guard-action.ts`) zodat de ingevulde velden blijven staan. Een `try/catch` rond een server action moet `unstable_rethrow` gebruiken: Next rejecteert de action met de redirect na het opslaan.

### Open punten
- Alias-uniciteit controleren in `content.test.ts`.
- Relatieve afbeeldingen in de Markdown-body worden nog niet afgehandeld.
- `concept` op pagina's wordt genegeerd.
- Gecachte arrays worden by reference teruggegeven (stap 3/6).
- `copy-content-assets`: is-main via realpath; Node ≥ 20.12 vastleggen; `content/` in de standalone-trace opnemen.
- Mail-linkscanners (bv. Outlook SafeLinks) kunnen het eenmalige login-token opgebruiken; overweeg later een bevestigingspagina vóór het verbruiken.
- `vitest.config.mts`: commentaar verwijst nog naar Auth0-sessies; `app/features/admin/**` kan terug in coverage (beschermd bestand, toestemming Tom).
- Schema's: `z.strictObject`, `min(1)` op verplichte strings.
- Editor: activiteiten hebben een optioneel `programma` (rijen uur/titel/info, als JSON in één verborgen veld). Pagina's en juridische teksten zijn nog niet bewerkbaar; een expliciete status 'uitgeschakeld' voor gebruikers ontbreekt (intrekken = gebruiker verwijderen).
- Editor: tree-entries van GitHub worden niet op vorm gecontroleerd; fast-forward-detectie leunt op de foutmelding van GitHub (faalt veilig); de recursieve tree wordt per commit voor de hele repo opgehaald.
- Editor: de eerste opslag van een bestaand item normaliseert de YAML (aanhalingstekens, emoji-escapes, lege `aliassen`) en geeft dus een grotere diff; verwijderen faalt met een melding als een itemmap een bestand buiten de whitelist bevat.
- Contourstijl (nov 2026): alle publieke pagina's, ook 404/500 (`app/components/error-pages.tsx`, `app/global-error.tsx`) en `/offline`. De hero en de foutpagina's tonen cirkels in logokleuren (`LogoCircles`) tot er een sfeerfoto is (nog geen `afbeelding`-veld op pagina's). Alleen admin en editor (en `AdminErrorPage`) gebruiken nog de zachte stijl: Card (default/elevated/bordered/ghost), FormField, Input, Select, Switch, Textarea, Modal.
- Contactformulier: server action (`app/(main)/contact/actions.ts`) op `submitContact` (`app/lib/contact-submit.ts`), werkt zonder JavaScript; validatie en meldingen in `app/lib/contact-validation.ts`. Geen reCAPTCHA (sinds nov 2026 helemaal weg): spam wordt geweerd met de honeypot en een ondertekende tijdscontrole (`app/lib/form-timing.ts`, HMAC met `AUTH_SECRET`, minstens 3 s tussen tonen en versturen, max. 24 u); te snel of vervalst krijgt stil een 'verstuurd'. De rate limit van contact- en feedbackformulier staat in SQLite (`rate_limit_hits`, `app/lib/persistent-rate-limit.ts`, per scope) met een HMAC van het IP, en overleeft een herstart. Het feedbackformulier (in de statische voet) haalt zijn token pas op bij het openen (`GET /api/feedback/token`) en wacht zelf tot de minimale tijd voorbij is voor het verstuurt; `minimumFillMs` staat in `form-timing-limits.ts` zodat de browser hem kan lezen.
- `/[tekst]`, `/activiteiten/[slug]` en `/nieuws/[slug]` hebben `dynamicParams = false`: alleen bestaande items worden gerenderd, een onbekende URL krijgt de 404 met inhoud van de server (ook zonder JavaScript). Een nieuw item vraagt dus een build (gebeurt bij elke push naar `main`, ook na een opslag in de editor). Oude adressen (`aliassen`) worden bij de build uit `content/` gelezen (`scripts/content-redirects.js` (CommonJS, voor `next.config.js`)) en in `next.config.js` als 308-redirect gezet; aliassen die een bestaande slug zouden overschaduwen, dubbel staan of rare tekens bevatten worden overgeslagen met een waarschuwing in de buildlog. Let op bij lokaal testen van de standalone build: het proces hernoemt zichzelf, stop het via de poort (`lsof -ti:PORT | xargs kill`), niet met `pkill -f server.js`.
- Ongeldige percent-encoding: `proxy.ts` draait voor elk adres (behalve `_next/static` en `_next/image`) en geeft een korte 400-pagina als het pad niet als UTF-8 te decoderen is (bv. `%E0%A4`; Next.js gaf daar een stille 500). Een syntactisch kapotte escape (`%A`, `%ZZ`) komt nooit bij de app: Caddy (Go) weigert hem zelf, met 400 over HTTP/1.1 en een stream-reset (`PROTOCOL_ERROR`, dus "geen antwoord") over HTTP/2. Ongeldige escapes in de querystring normaliseert Next.js al voor de proxy; de pagina's verdragen dat. Caddy logt geen toegangsregels (geen `log` in de Caddyfile), alleen fouten.
- Nieuwsberichten: `segmenten` (body gesplitst op de gesanitizede boom) voor citaten als spraakballon; nooit HTML-strings splitsen met een regex.
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
