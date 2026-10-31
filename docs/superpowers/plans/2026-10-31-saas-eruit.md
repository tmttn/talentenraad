# SaaS eruit (stap 4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auth0 vervangen door magic-link login per e-mail, Resend door SMTP, en Hypertune/feature flags, Sentry, push-notificaties, claps en de Vercel-pakketten verwijderen — zonder zichtbare wijziging voor bezoekers.

**Architecture:** Eigen kleine auth in `app/lib/auth/`: eenmalige login-tokens (alleen SHA-256-hash in de DB, 15 min geldig), sessie als HS256-JWT in een `httpOnly`-cookie (`jose`), bij elke admin-request gecontroleerd tegen de `users`-tabel. Mail via `nodemailer` met `SMTP_*`-env; in development zonder `SMTP_HOST` naar de console. Features die achter flags zaten blijven aan (de fallbackwaarden uit `app/lib/flag-defaults.ts`); seizoensversiering hangt alleen nog af van `site.yaml` `decoraties.enabled`.

**Tech Stack:** Next.js 16, TypeScript strict, Drizzle (Postgres tot stap 5), `jose`, `nodemailer`, Vitest.

**Spec:** CLAUDE.md "Revival"-sectie (beslissingen Tom: Auth0 → magic-link per e-mail, Resend → gewone SMTP; flags, Sentry, Vercel Analytics/Speed Insights, push en claps weg). Keuzes Claude (gemeld aan Tom 2026-10-31): eigen magic-link-implementatie, nodemailer, features achter flags blijven aan, DB-tabellen blijven tot stap 5.

## Global Constraints

- Bezoekers merken niets: elke publieke route rendert hetzelfde als op `63f5fe3` (features die achter een flag zaten = aan, zoals de fallbacks).
- Admin-toegang: alleen gebruikers in `users` met `isAdmin = true`, of e-mails in `ADMIN_EMAILS` (bestaand gedrag van `verifyAdmin` in `app/lib/auth0.ts`). Niet-admins kunnen niet inloggen.
- Login-token: 32 random bytes (`crypto.randomBytes`), base64url in de link; in de DB alleen `sha256(token)` (hex); `expiresAt = now + 15 min`; eenmalig (`usedAt` gezet bij gebruik, tweede gebruik faalt); vergelijken via hash-lookup.
- Antwoord op een login-aanvraag is altijd hetzelfde (geen user-enumeration): "Als dit adres toegang heeft, ontvang je een e-mail met een link."
- Rate limit: max 5 aanvragen per e-mailadres per 15 minuten (telling in `login_tokens`); daarboven geen nieuwe mail, zelfde antwoord.
- Sessiecookie `tr_session`: JWT HS256 met `AUTH_SECRET` (≥ 32 tekens, anders opstartfout), claims `sub` = user id, `email`, `iat`, `exp` = 7 dagen; cookie `httpOnly`, `secure` (behalve in development), `sameSite: 'lax'`, `path: '/'`. Uitloggen wist de cookie.
- Login-link: `${SITE_URL}/api/auth/verify?token=…`; `SITE_URL` uit env, fallback `http://localhost:3000` alleen in development.
- Mail: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`; zonder `SMTP_HOST` in development → mailinhoud naar `console.info`; zonder `SMTP_HOST` in productie → fout.
- Database: nieuwe tabel `login_tokens` via een Drizzle-migratie in `drizzle/`. Bestaande tabellen (`push_subscriptions`, `notification_history`, `content_claps`, `clap_sessions`, `sponsor_analytics`, `site_settings`, kolom `users.auth0_id`) blijven tot stap 5; niets leest of schrijft ze nog.
- `@vercel/postgres` mag weg als niets het importeert (de DB gebruikt `postgres-js`).
- Tests: Vitest; elke nieuwe module getest; coverage ≥ 50% op alle vier (niet verlagen).
- Checklist: `npm run lint && npm run type-check && npm run test:coverage && npm run build`. Hook; geen `--no-verify`; commits SSH-ondertekend (bij falen: werk gestaged laten en BLOCKED melden). Types: feat, fix, style, refactor, perf, test, docs, chore.
- Codestijl: 2 spaties, enkele quotes, `??`, `item => …`. Geen XO.
- `.env.example` (aanmaken of bijwerken): alle nieuwe env-vars met lege waarden en een korte uitleg; Auth0/Resend/Sentry/Hypertune/VAPID-vars eruit. `.env.local` nooit aanraken.

## Review Focus

1. **Token hergebruik / verlopen**: tweede klik op dezelfde link of een link na 15 min → terug naar login met melding, geen sessie. Test in Task 5.
2. **Niet-admin of onbekend adres**: zelfde antwoord als bij een admin, geen mail verstuurd, geen token aangemaakt. Test in Task 5.
3. **Vervalste of verlopen cookie**: verkeerde handtekening, verlopen `exp`, of gebruiker niet meer admin → behandeld als uitgelogd (redirect naar `/admin/login`, API 401). Test in Task 5.
4. **Open redirect**: een eventuele `returnTo`-parameter accepteert alleen paden die met `/admin` beginnen. Test in Task 5.
5. **SMTP-fout**: mail versturen faalt → login-aanvraag geeft nog steeds het neutrale antwoord, fout gelogd; contactformulier geeft de bestaande foutmelding. Test in Task 4.

---

### Task 1: Feature flags eruit

**Files:** Delete `app/lib/flags.ts`, `app/lib/flags-client.tsx`, `app/lib/flag-defaults.ts`, `generated/hypertune/**`, Hypertune-config/scripts; Modify alle `useFlag`/`getFlag`/flag-provider-gebruik (21 bestanden), `app/(main)/layout.tsx` (seizoensversiering: alleen `site.decoraties.enabled`), `package.json` (`hypertune`, `flags`, `@flags-sdk/*` weg), `tsconfig`-paths NIET wijzigen (`@generated/*` alias mag blijven staan); tests mee.

**Interfaces:** Produces: geen flag-API meer; elke voorheen geflagde UI rendert alsof de flag `true` is (behalve `seasonalDecorations`: gestuurd door `site.yaml`).

- [ ] Tests aanpassen: geen flag-mocks meer; componenten renderen hun feature standaard.
- [ ] Implementeren; `grep -rniE "useFlag|hypertune|flags/next|@flags-sdk|flag-defaults" app __tests__ package.json` → leeg.
- [ ] Checklist; commit `chore: remove feature flags`.

### Task 2: Sentry, Vercel Analytics/Speed Insights, Edge Config eruit

**Files:** Delete `sentry.*.config.ts`, Sentry-specifieke code in `instrumentation.ts` (bestand weg als er niets overblijft); Modify `next.config.js` (`withSentryConfig` weg), error-boundaries (`app/global-error.tsx`, `app/(main)/error.tsx`, `app/(admin)/admin/error.tsx`, `app/(admin)/admin/(protected)/error.tsx`: `Sentry.captureException` → `console.error`), `app/layout.tsx` (`<Analytics/>`, `<SpeedInsights/>` weg), `package.json` (`@sentry/nextjs`, `@vercel/analytics`, `@vercel/speed-insights`, `@vercel/edge-config`, `@vercel/postgres` weg indien ongebruikt), CI-env (`SENTRY_*`).

- [ ] Tests voor error-boundaries: fout wordt gelogd, UI ongewijzigd.
- [ ] Implementeren; `grep -rniE "sentry|@vercel/" app *.ts next.config.js package.json .github` → alleen niet-pakket-vermeldingen (bv. `vercel.json` blijft tot stap 5).
- [ ] Checklist; commit `chore: remove Sentry and Vercel analytics packages`.

### Task 3: Push-notificaties en claps eruit

**Files:** Delete `app/lib/hooks/use-push-notifications.ts`, `app/api/push/**`, `app/api/admin/notifications/**`, `app/(admin)/admin/(protected)/notificaties/**`, `app/components/claps/**`, `app/api/claps/**`, `app/lib/claps-admin.ts`, push-gerelateerde UI (toestemmingsprompt e.d.), push-handlers in `app/sw.ts` (service worker en offline-pagina blijven); Modify admin-sidebar en admin-dashboard (notificaties/claps weg), `app/components/feedback/conditional-feedback-button.tsx` (claps-afhankelijkheid weg, feedbackknop blijft), `package.json` (`web-push`, `@types/web-push` weg); tests mee.

- [ ] Tests: feedbackknop rendert nog; dashboard zonder claps-/notificatietegels.
- [ ] Implementeren; `grep -rniE "web-push|pushSubscri|vapid|clap" app __tests__ package.json` → alleen DB-schema (`app/lib/db/schema.ts`) en `drizzle/`.
- [ ] Checklist; commit `chore: remove push notifications and claps`.

### Task 4: SMTP-mailer i.p.v. Resend

**Files:** Create `app/lib/email/mailer.ts`; Modify `app/lib/email/resend.ts` → hernoemen naar `app/lib/email/messages.ts` (zelfde HTML/tekst-templates, verzending via mailer), `app/api/contact/route.ts`, gebruikers-uitnodiging (`app/api/admin/users/**`, `users-manager.tsx`); Delete Resend-dep; tests.

**Interfaces:** Produces: `sendMail({to, subject, html, text}): Promise<void>` (gooit bij SMTP-fout); `sendContactNotification(data)` en `sendInvitationEmail(data)` behouden hun signatuur; `sendLoginLink({to, url}): Promise<void>` (nieuw, gebruikt door Task 5). Uitnodigingsmail verwijst naar `${SITE_URL}/admin/login` (geen Auth0-uitleg meer).

- [ ] Tests: mailer met gemockte `nodemailer.createTransport` (juiste host/port/auth/from); dev zonder `SMTP_HOST` → `console.info`, productie zonder `SMTP_HOST` → fout; contact-route geeft bij mailfout de bestaande foutrespons (Review Focus 5).
- [ ] Implementeren.
- [ ] Checklist; commit `feat: send mail via SMTP instead of Resend`.

### Task 5: Magic-link login i.p.v. Auth0

**Files:** Create `app/lib/auth/tokens.ts`, `app/lib/auth/session.ts`, `app/lib/auth/admin.ts` (verhuist `isAdminEmail`/`verifyAdmin` uit `auth0.ts`), `app/api/auth/request/route.ts`, `app/api/auth/verify/route.ts`, `app/api/auth/logout/route.ts`, Drizzle-migratie voor `login_tokens`; Modify `app/lib/db/schema.ts` (tabel `loginTokens`: `id` uuid pk, `email` text, `tokenHash` text unique, `expiresAt` timestamp, `usedAt` timestamp null, `createdAt`), `proxy.ts` (Auth0-middleware → sessiecheck voor `/admin` behalve `/admin/login`; ongeldige sessie → redirect `/admin/login`), alle admin-API-routes en `(protected)/layout.tsx` (`auth0.getSession()` → `getSession()`), `app/(admin)/admin/login/page.tsx` (e-mailformulier + "check je mail"-staat + foutmelding bij `?error=`), `session-validator.tsx`, users-routes (`auth0Id`-gebruik weg; `acceptedAt` zetten bij eerste login); Delete `app/lib/auth0.ts`, `app/api/admin/auth/logout/**` (vervangen), `@auth0/nextjs-auth0`; tests.

**Interfaces:**
- `createLoginToken(email: string): Promise<string | undefined>` — undefined als rate limit bereikt; `consumeLoginToken(token: string): Promise<{email: string} | undefined>` — undefined bij onbekend/verlopen/gebruikt.
- `createSessionCookie(user: {id: string; email: string}): Promise<string>` (JWT), `readSession(cookieValue: string | undefined): Promise<{userId: string; email: string} | undefined>`, `getSession(): Promise<{user: {id: string; email: string; name: string | null}} | undefined>` — leest cookie via `next/headers`, verifieert JWT én dat de gebruiker nog admin is (`verifyAdmin`).
- `POST /api/auth/request` body `{email}` → altijd 200 `{message: <neutrale tekst>}`; alleen bij admin + onder rate limit: token + `sendLoginLink`.
- `GET /api/auth/verify?token=…[&returnTo=/admin/…]` → geldig: cookie zetten, `users.acceptedAt` zetten als die leeg is (gebruiker aanmaken als hij alleen via `ADMIN_EMAILS` admin is), redirect naar `returnTo` (alleen als het met `/admin` begint) of `/admin`; ongeldig: redirect `/admin/login?error=link`.
- `POST /api/auth/logout` → cookie wissen, redirect `/admin/login`.

- [ ] Tests (Review Focus 1–4): token hash ≠ token; verlopen en tweede gebruik → undefined; rate limit; niet-admin → geen token en geen mail; vervalste/verlopen JWT → undefined; gebruiker niet meer admin → `getSession` undefined; `returnTo=https://evil.example` → redirect `/admin`; proxy redirect zonder sessie; login-pagina toont "check je mail" na verzenden.
- [ ] Implementeren; migratie genereren met `npm run db:generate` (controleer de SQL: alleen `CREATE TABLE login_tokens …`).
- [ ] `grep -rniE "auth0" app __tests__ proxy.ts package.json` → alleen de kolom in `schema.ts` en `drizzle/`.
- [ ] Checklist; commit `feat: magic-link login instead of Auth0`.

### Task 6: Afronden

**Files:** Modify CLAUDE.md (stap 4 `[x]`; Open punten bijwerken: oude tabellen en `users.auth0_id` opruimen in stap 5; `AUTH_SECRET`, `SITE_URL`, `SMTP_*` in compose/secrets van stap 5), `.env.example`, README indien env beschreven.

- [ ] `npm run build && npm run start` met dummy-env in de shell (nooit in bestanden): `/`, `/kalender`, `/contact` → 200; `/admin` zonder cookie → 307 naar `/admin/login`; `/admin/login` → 200; `POST /api/auth/request` met willekeurig adres → 200 met neutrale tekst.
- [ ] Checklist; commit `docs: step 4 done`.
