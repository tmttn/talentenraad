# Bestelsysteem fase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Een actie (pizzaverkoop, ontbijtmanden, fuifkaarten) loopt van bestelling tot afhalen op de eigen site: ouders bestellen zonder account, betalen per overschrijving of cash, krijgen een QR-code per mail zodra een lid met toegang tot de bankrekening de betaling bevestigt, en een lid of helper scant die code bij het afhalen.

**Architecture:** Acties zijn Markdown met frontmatter in `content/acties/<slug>/index.md`, met een zod-schema en een eigen formulier in de bestaande editor. Bestellingen staan in SQLite (`orders`, `order_lines`, Drizzle), met een snapshot van naam, prijs en keuzes. Publiek: `/acties`, `/acties/[slug]` (server action, werkt zonder JavaScript) en `/b/[token]`. Beheer onder `/admin/bestellingen`, de afhaal-app onder `/admin/afhalen` (eigen route group, eigen app-layout). Mails via de bestaande SMTP-mailer, QR als ingebedde PNG.

**Tech Stack:** Next.js 16 (app router, server actions), Drizzle + better-sqlite3, zod 4, nodemailer, sharp (PNG van de QR-SVG), `qrcode-generator` (QR maken, geen dependencies) en `jsqr` (QR lezen waar `BarcodeDetector` ontbreekt, alleen dynamisch geladen), Vitest.

**Spec:** [Bestelsysteem voor acties](https://claude.ai/artifact/VSUZokvGPrTwWmHTNzE6Pu) (Claude Docs, 5 nov 2026) + mockups in de rij "Bestelsysteem" op het [canvas van de site](https://claude.ai/artifact/GvHJCD2D5yFHeXSQhhCpEn) (`Bestellen`, `BestellenMobiel`, `MailBevestiging`, `MailQR`, `Bestelstatus`, `AppScan`, `AppAfgifte`, `AppWaarschuwing`, `Beheer`). Antwoorden van Tom in de spec: voorlopig rekeningnummer kiezen; betalingen bevestigen alleen met toegang tot de bankrekening; eerste actie pizzaverkoop januari 2027; voorlopig altijd afhalen; ouders mogen zelf annuleren tot de bestelperiode sluit; feitelijke vereniging; online betalen voorlopig negeren.

## Global Constraints

- **Vier PR's, in volgorde, elk groen op lint, type-check, tests (coverage ≥ 50%) en build:** (1) acties in `content/` met schema en editor, (2) bestellen, mails en `/b/[token]`, (3) beheer en het vinkje 'toegang tot de bankrekening', (4) afhaal-app met scanner en de rol helper. Elke PR is op zich uitrolbaar.
- **Rekeningnummer:** één keer in `content/site.yaml` onder `bestellingen.rekening` (`iban`, `begunstigde`). Tot Tom het echte nummer geeft: `BE68 5390 0754 7034`, begunstigde `Talentenraad Het Talentenhuis`. Zolang dat voorbeeldnummer er staat: het beheer toont een waarschuwing en in productie (`NODE_ENV=production`) kan geen enkele actie open ("Bestellen kan binnenkort"). Lokaal en in tests wel, met dezelfde waarschuwing. IBAN wordt in het schema gecontroleerd (lengte BE 16, modulo 97).
- **Bedragen altijd in cent** (integers), ook in de database. Weergave `€ 12,50` (nl-BE, spatie na €). De editor toont en leest euro's ("12,50" of "12.50") en schrijft cent weg.
- **Datums:** `YYYY-MM-DD`-strings in de content, vergeleken met `todayString()` (lokale tijd; container `TZ=Europe/Brussels`). Een bestelperiode loopt van `van` tot en met `tot`.
- **Afwijking van de spec-YAML:** een afhaalmoment krijgt `datum` + `uur` + `plaats` in plaats van één vrije `label`; het label ("Vrijdag 22 januari, 17:00 - 19:00") wordt afgeleid. Nodig voor de bewaartermijn (3 maanden na het laatste afhaalmoment), de volgorde in de afhaal-app en later de herinnering "de dag voor het afhalen".
- **Producten met keuzes:** elke combinatie van keuzes is een variant met een eigen aantalveld (bv. Ontbijtmand: Wit [ ] Bruin [ ] Glutenvrij +€ 2 [ ]). Werkt zonder JavaScript, en de productielijst telt per variant. Hoogstens 12 varianten per product. `maxPerBestelling` (standaard 10) en `voorraad` gelden voor het product, opgeteld over de varianten.
- **Bestelnummer** loopt per actie (1, 2, 3 …). **Gestructureerde mededeling** komt uit een globaal volgnummer (uniek over alle acties): basis = volgnummer op 10 cijfers, controle = basis mod 97 (0 → 97), weergave `+++123/4567/89002+++`.
- **Token:** 128 bits uit `crypto.randomBytes(16)`, base64url (22 tekens), in de link `/b/<token>`. **Korte code:** 6 tekens uit `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (geen 0/O, 1/I), uniek per actie, weergave `K7P-4QX`; zoeken negeert hoofdletters, spaties en streepjes.
- **Statussen** (`orders.status`): `wacht` (wacht op betaling), `betaald` (QR verstuurd), `afgehaald`, `geannuleerd`, `terugbetalen` (geannuleerd na betaling). Terugbetaald zetten = `geannuleerd` + `terugbetaaldOp`. Een bestelling van € 0 gaat meteen naar `betaald`. Betaalbron `manueel` | `bank` | `online` (fase 1 alleen `manueel`), betaalwijze `overschrijving` | `cash`.
- **Gelijktijdigheid:** voorraadcontrole, nummer en opslag in één `BEGIN IMMEDIATE`-transactie (`db.transaction(…, {behavior: 'immediate'})`). Meegeven en betaald zetten zijn voorwaardelijke updates (`WHERE status = …`); wie te laat is, krijgt de actuele toestand te zien.
- **Rollen:** `admin`, `redacteur` (beheer en editor) en nieuw `helper` (alleen de afhaal-app). Los daarvan een vinkje `bankToegang` per gebruiker: alleen dan verschijnen 'Betaald', 'Cash ontvangen' en 'Terugbetaald', en de server weigert die acties zonder vinkje. Elke controle gebeurt op de server.
- **Privacy:** helpers zien naam (en kind), producten, notitie en het open bedrag van de gescande bestelling, nooit e-mail, telefoon of bedragen van andere bestellingen. De QR bevat alleen de link. Naam, e-mail, telefoon, kind, klas, notitie en token worden 3 maanden na het laatste afhaalmoment van de actie gewist (dagelijkse taak); nummer, producten, bedragen en data blijven. Privacybeleid krijgt een paragraaf 'Bestellingen'. De repo is publiek: geen echte persoonsgegevens in tests of content.
- **Formulieren:** zelfde spamwering als het contactformulier: honeypot (`HoneypotField`), ondertekende tijdscontrole (`issueFormToken`/`checkFormToken`, purpose `bestellen`), SQLite-rate-limit (`createPersistentRateLimiter`, scope `bestellen`, `formRateLimit`). Spam krijgt stil een 'bedankt'. Fouten onder het veld, `aria-invalid`, focus naar het eerste foute veld, waarden blijven staan; zonder JavaScript rendert de server dezelfde meldingen.
- **`/b/[token]`:** `noindex` (metadata) en `Disallow: /b/` in `robots.ts`; een onbekend of misvormd token geeft de gewone 404; meer dan 20 missers per 10 minuten per IP (scope `bestelpagina`) → ook bekende tokens geven 404 tot het venster voorbij is.
- **Audit log:** elke statuswijziging, notitie en mail opnieuw sturen via `logAudit` (`resourceType: 'bestelling'`, `resourceId` = order-id, `metadata.actie` = wat er gebeurde, bv. `betaald`, `geannuleerd`, `meegegeven`).
- **UI:** publieke pagina's in de contourstijl van het design system "Talentenraad Beverst" (mockups `Bestellen`, `Bestelstatus`, mails), beheer en afhaal-app in de zachte stijl (mockups `Beheer`, `App*`). Je-vorm, koppen in zinsbouw, knoplabels als werkwoord, Lucide-iconen, geen emoji, waarschuwingen altijd in kleur én tekst. Tekst haalt 4,5:1; `color-accent` nooit voor kleine tekst.
- **Mails:** HTML met tabellen en inline stijlen (mailclients), plus platte tekst; alle invoer van ouders HTML-geëscaped; `replyTo` = `footer.email` uit `site.yaml`. Een mislukte mail breekt de bestelling nooit; `bevestigingVerstuurdOp` / `qrVerstuurdOp` tonen in het beheer of hij vertrok.
- **Repo-regels:** `vitest.config.mts`, `eslint.config.mjs`, `tsconfig.json` niet aanraken. Migraties met `npm run db:generate`. Stijl van de bestaande code (`??`, enkele quotes, `item => …`). Commits conventional, hook nooit overslaan.

## Review Focus

1. **Twee ouders bestellen tegelijk het laatste stuk** → één lukt, de ander ziet "Nog 0 Margherita over" onder dat product; nooit meer verkocht dan `voorraad`. Test in Task 2.3 (twee `plaatsBestelling` na elkaar met voorraad 1, plus een geannuleerde bestelling die voorraad vrijgeeft).
2. **De actie wijzigt terwijl een ouder het formulier open heeft** (product verwijderd, keuze hernoemd, bestelperiode net voorbij) → geen 500 en geen verkeerde regel: onbekende velden geven "Deze actie is net aangepast. Kijk je bestelling na.", een gesloten actie "De bestelperiode is voorbij." Test in Task 2.2 en 2.3.
3. **Twee helpers scannen dezelfde bestelling** → de tweede ziet "Al afgehaald om 17:42 door Sara", niets wordt twee keer gezet. Test in Task 4.2.
4. **Een helper of redacteur probeert iets wat niet mag** (helper op `/admin/content` of `/admin/bestellingen`, redacteur zonder vinkje roept de server action 'betaald' aan, helper roept `guardEditorApi`-routes aan) → redirect of 403, niets gewijzigd. Test in Task 3.1 en 4.1.
5. **Naam met HTML of een `'` (O'Brien)** in de mail, de CSV-export en het beheer → correct getoond, nooit als HTML uitgevoerd; CSV-cellen die met `=`, `+`, `-` of `@` beginnen krijgen een `'` ervoor. Test in Task 2.4 en 3.3.

---

## PR 1 — Acties in `content/` met schema en editor

### Task 1.1: Schema, IBAN en lezen

**Files:**
- Create: `app/lib/content/iban.ts`, `app/lib/bestellingen/acties.ts`, `app/lib/bestellingen/geld.ts`
- Modify: `app/lib/content/schemas.ts`, `app/lib/content/reader.ts`, `app/lib/content/index.ts`, `content/site.yaml`, `scripts/content-redirects.js` (aliassen van acties), `__tests__/helpers/…` (site-fixture)
- Create content: `content/acties/pizzaverkoop-2027/index.md` met `concept: true` (prijzen uit de mockup, datums voorlopig, in de PR gemarkeerd)
- Test: `__tests__/lib/content/schemas.test.ts`, `__tests__/lib/content/iban.test.ts`, `__tests__/lib/bestellingen/acties.test.ts`, `__tests__/lib/bestellingen/geld.test.ts`, `__tests__/content/content.test.ts`

**Interfaces (Produces):**
- `actieSchema` (`z.strictObject`): `titel`, `samenvatting` (verplicht), `afbeelding?: './afbeelding.jpg'`, `bestellen: {van, tot}` (`datumSchema`, `tot >= van`), `betalen: {wijzen: ('overschrijving'|'cash')[] (min 1, uniek), binnenDagen: int 0–60 = 5}`, `vraag: {kind: boolean = false}` (= `{kind: false}`), `afhalen: {id, datum, uur, plaats}[]` (min 1), `producten: {id, naam, info?, prijs (int ≥ 0), voorraad? (int ≥ 0), maxPerBestelling (int 1–100 = 10), opties: {id, naam, keuzes: {naam, meerprijs (int ≥ 0 = 0)}[] (min 1)}[] = []}[]` (min 1), `aliassen`, `concept`. Ids `^[a-z0-9]+(-[a-z0-9]+)*$`, uniek per lijst; keuzenamen uniek per optie; ≤ 12 varianten per product.
- `siteSchema.bestellingen = {rekening: {iban, begunstigde}}`, standaard het voorbeeldnummer.
- `iban.ts`: `isGeldigeIban(value): boolean`, `formatIban(value): string` (groepen van 4), `voorbeeldIban = 'BE68539007547034'`, `isVoorbeeldRekening(iban): boolean`.
- `geld.ts`: `formatEuro(cent: number): string` (`€ 12,50`), `parseEuro(text: string): number | undefined` (cent; "12", "12,5", "12,50", "12.50", "€ 12,50"; negatief of > 2 decimalen → undefined).
- `acties.ts` (client-safe, geen node-imports): `type Actie`, `actieStatus(actie, today): 'binnenkort' | 'open' | 'gesloten'`, `afhaalLabel(moment): string`, `productVarianten(product): Variant[]` met `Variant = {sleutel: string; keuzes: {optie: string; keuze: string}[]; prijs: number; label: string}` (`sleutel` = keuzenamen, elk `encodeURIComponent`, gescheiden door `/`; leeg zonder opties), `veldnaam(productId, sleutel): string` (`aantal:<id>` of `aantal:<id>:<sleutel>`).
- Reader: `getActies(): Actie[]` (gesorteerd op `bestellen.van`), `getActie(slug): Actie | undefined` (ook via alias), `content.getActies/getActie`.

- [ ] Tests: schema weigert `tot < van`, dubbele product-id, keuzenaam dubbel, prijs 12.5, 13 varianten, onbekend veld; site zonder `bestellingen` krijgt het voorbeeldnummer; `isGeldigeIban('BE68 5390 0754 7034') === true`, `'BE68 5390 0754 7035'` false; `formatEuro(1250) === '€ 12,50'`, `formatEuro(0) === '€ 0,00'`; `parseEuro('12,5') === 1250`, `parseEuro('-1') === undefined`; `actieStatus` op de dag `van` en `tot` = `open`, dag erna `gesloten`; `productVarianten` met 2 opties (2×3) geeft 6 varianten met juiste meerprijs; `content.test.ts` laadt `getActies()`.
- [ ] Implementeren; checklist; commit `feat: acties in content with schema`.

### Task 1.2: Editor voor acties

**Files:**
- Modify: `app/lib/content-store/entry-types.ts` (type `acties`, label "Acties", "Actie toevoegen", `imageField: 'afbeelding'`), `app/lib/content-store/serialize.ts` (`fieldOrder`, `schemas`, `bodyField: 'inhoud'`, `slugField: 'titel'`, `parseActieForm`), `app/lib/content-store/paths.ts` (`acties/<slug>/index.md|afbeelding.jpg`), `app/lib/content-store/entries.ts` (titel, ondertitel = `bestellen.van`), `app/(admin)/admin/(protected)/content/actions.ts` (acties door `parseActieForm`), `…/content/page.tsx` (tegel Acties), `…/content/[type]/nieuw/page.tsx` en `[slug]/page.tsx` (ActieForm voor acties), `proxy.ts` (`acties` in het editorpatroon), `docs/handleiding-editor.md`
- Create: `app/features/admin/content-editor/actie-form.tsx`, `…/producten-field.tsx`, `…/afhaalmomenten-field.tsx`
- Test: `__tests__/lib/content-store/serialize.test.ts`, `__tests__/lib/content-store/paths.test.ts`, `__tests__/features/admin/actie-form.test.tsx`, `__tests__/api/admin-content-routes.test.ts`

**Interfaces:**
- Consumes: `actieSchema`, `parseEuro`, `formatEuro` (Task 1.1).
- Produces: `parseActieForm(values: FormValues): ParsedEntryForm` — velden `titel`, `samenvatting`, `bestellenVan`, `bestellenTot`, `binnenDagen`, `wijzeOverschrijving`, `wijzeCash` (checkboxes), `vraagKind` (switch), `afhalen` (JSON-rijen `{id?, datum, uur, plaats}`), `producten` (JSON `{id?, naam, info, prijs: "12,50", voorraad: "", maxPerBestelling: "", opties: [{id?, naam, keuzes: [{naam, meerprijs: "2,00"}]}]}`), `inhoud`, `concept`. Ontbrekende id's worden `slugify(naam)` (botsing → `-2`); bestaande id's blijven, zodat bestellingen hun product terugvinden. Fouten per veld (`producten`, `afhalen`) met de eerste schema-melding.
- `serializeEntry('acties', …)` laat `vraag` weg als `kind` false is, `opties` als leeg, `meerprijs` als 0.

- [ ] Tests: round-trip van het voorbeeld (`parseActieForm` → `serializeEntry` → reader = gelijk); prijs "12,5" → 1250, "abc" → veldfout bij `producten`; geen betaalwijze → fout; nieuw product zonder id krijgt `margherita`, twee keer "Margherita" → `margherita-2`; bestaand id blijft na hernoemen; `assertAllowedPath('content/acties/x/index.md')` ok, `content/acties/x/foo.js` geweigerd; ActieForm rendert rijen voor producten, keuzes en afhaalmomenten, toevoegen/verplaatsen/verwijderen werkt, de verborgen JSON volgt; proxy laat `/admin/content/acties/pizzaverkoop-2027` door.
- [ ] Implementeren; checklist; commit `feat: editor for acties`; PR 1 openen.

---

## PR 2 — Bestellen, mails en `/b/[token]`

### Task 2.1: Tabellen, codes en mededeling

**Files:**
- Modify: `app/lib/db/schema.ts` (+ migratie `drizzle/0003_*`)
- Create: `app/lib/bestellingen/mededeling.ts`, `app/lib/bestellingen/codes.ts`
- Test: `__tests__/lib/db/database.test.ts` (tabellenlijst), `__tests__/lib/bestellingen/mededeling.test.ts`, `__tests__/lib/bestellingen/codes.test.ts`

**Interfaces (Produces):**
- `orders`: `id`, `actie`, `nummer`, `volgnummer` (uniek), `mededeling` (12 cijfers, uniek), `token` (uniek, nullable na wissen), `korteCode`, `naam`, `email`, `telefoon?`, `kindNaam?`, `kindKlas?`, `afhaalId`, `afhaalDatum`, `afhaalLabel`, `totaalCent`, `status`, `betaalwijze?`, `betaalbron?`, `betaaldOp?`, `betaaldDoor?`, `afgehaaldOp?`, `afgehaaldDoor?`, `geannuleerdOp?`, `geannuleerdDoor?`, `annuleerReden?`, `terugbetaaldOp?`, `terugbetaaldDoor?`, `notitie?`, `bevestigingVerstuurdOp?`, `qrVerstuurdOp?`, `gewistOp?`, `aangemaaktOp`. Uniek `(actie, nummer)`, `(actie, korteCode)`; index `(actie, status)`, `(actie, afhaalId)`. `*Door` is tekst (naam of e-mail van het lid, of `ouder`).
- `order_lines`: `id`, `orderId` (FK, cascade), `volgorde`, `productId`, `naam`, `keuzes` (JSON `{optie, keuze}[]`), `prijsCent` (per stuk, met meerprijs), `aantal`, `meegegeven` (bool).
- `orderStatuses`, `type OrderStatus`, `type Order`, `type OrderLine`.
- `mededelingVoor(volgnummer: number): string` (12 cijfers), `formatMededeling(digits): string`, `isGeldigeMededeling(text): boolean`.
- `nieuwToken(): string`, `isTokenVorm(text): boolean`, `nieuweKorteCode(): string`, `formatKorteCode(code): string`, `normaliseerKorteCode(text): string`.

- [ ] Tests: migratie maakt `orders` en `order_lines`; `mededelingVoor(14) === '000000001414'`, `formatMededeling` → `+++000/0000/01414+++`, een basis deelbaar door 97 krijgt controle 97; `isGeldigeMededeling('+++000/0000/01414+++')`, met tikfout false; token 22 tekens, 128 bits; korte code nooit 0/O/1/I (1000 keer); `normaliseerKorteCode(' k7p-4qx ') === 'K7P4QX'`.
- [ ] Implementeren; checklist; commit `feat: order tables and payment references`.

### Task 2.2: Bestelformulier lezen en controleren

**Files:**
- Create: `app/lib/bestellingen/formulier.ts`
- Test: `__tests__/lib/bestellingen/formulier.test.ts`

**Interfaces (Produces):**
- `type BestelInvoer = {naam; email; telefoon; kindNaam; kindKlas; afhaalId; regels: {productId; sleutel; aantal}[]}`
- `leesBestelFormulier(actie: Actie, data: FormData | Record<string, string>): {invoer: BestelInvoer; fouten: BestelFouten; gewijzigd: boolean}` — `aantal:*`-velden (leeg = 0, geen geheel getal ≥ 0 → fout bij dat product); onbekend product of variant → `gewijzigd: true`.
- `type BestelFouten = Partial<Record<'naam' | 'email' | 'telefoon' | 'kindNaam' | 'kindKlas' | 'afhaalId' | 'producten' | `product:${string}`, string>>`
- `controleerBestelling(actie, invoer): BestelFouten` (client-safe, ook in de browser): naam ≥ 2 tekens, e-mail zoals het contactformulier, afhaalmoment bestaat, minstens één stuk ("Kies minstens één product."), per product ≤ `maxPerBestelling` ("Maximaal 10 Margherita per bestelling."), kind en klas verplicht als `vraag.kind`.
- `bestelMeldingen` (gedeelde teksten).

- [ ] Tests: lege bestelling, 11 stuks, onbekend afhaalmoment, e-mail zonder punt, telefoon optioneel, kindvelden alleen verplicht met `vraag.kind`, verdwenen variant → `gewijzigd`.
- [ ] Implementeren; checklist; commit `feat: order form parsing and validation`.

### Task 2.3: Bestelling plaatsen en annuleren

**Files:**
- Create: `app/lib/bestellingen/plaatsen.ts`, `app/lib/bestellingen/bestellingen.ts`, `app/lib/bestellingen/rekening.ts`
- Test: `__tests__/lib/bestellingen/plaatsen.test.ts`, `__tests__/lib/bestellingen/annuleren.test.ts` (echte SQLite via `createTestDb`, `@lib/db` gemockt zoals `tokens.test.ts`, mailer gemockt)

**Interfaces:**
- Consumes: Task 2.1, 2.2, `actieStatus`, `checkFormToken`, `createPersistentRateLimiter`.
- Produces:
  - `kanBestellen(actie, site, today, production = process.env.NODE_ENV === 'production'): {open: true} | {open: false; reden: 'binnenkort' | 'gesloten' | 'voorbeeldrekening' | 'concept'}`
  - `plaatsBestelling(actie, input: {data: FormData; website?: string; formToken?: string}, clientIp, now = new Date()): Promise<PlaatsResultaat>` met `PlaatsResultaat = {status: 'besteld'; token: string} | {status: 'spam'} | {status: 'ongeldig'; fouten: BestelFouten} | {status: 'gewijzigd'} | {status: 'gesloten'} | {status: 'uitverkocht'; fouten: BestelFouten} | {status: 'beperkt'} | {status: 'verlopen'} | {status: 'mislukt'}`. Volgorde zoals `submitContact`: honeypot → rate limit → open? → lezen/controleren → tijdscontrole → transactie (voorraad, `nummer`, `volgnummer`, korte code met nieuwe poging bij botsing, insert) → mail op de achtergrond.
  - `uitersteBetaaldatum(order, actie): string` (aanmaakdatum + `binnenDagen`)
  - `vindOpToken(token): Promise<OrderMetRegels | undefined>`, `type OrderMetRegels = Order & {regels: OrderLine[]}`
  - `annuleerDoorOuder(token, actie, now): Promise<'geannuleerd' | 'terugbetalen' | 'niet-mogelijk'>` (alleen `wacht`/`betaald`, alleen zolang `actieStatus` open is)
  - `verbruikteVoorraad(tx, actie, productIds): Map<string, number>` (niet-geannuleerde bestellingen)

- [ ] Tests (Review Focus 1, 2): bestelling bewaart snapshot (naam, prijs met meerprijs, keuzes) en totaal; nummers 1, 2 per actie en volgnummer doorlopend over acties; voorraad 1 → tweede bestelling `uitverkocht` met fout bij dat product; annuleren geeft voorraad vrij; € 0 → `betaald` met `betaaldOp`; honeypot → `spam` zonder rij; te snel → `spam`; gesloten actie → `gesloten`; voorbeeldrekening in productie → niet open; annuleren door ouder: `wacht` → `geannuleerd`, `betaald` → `terugbetalen`, na `tot` → `niet-mogelijk`, `afgehaald` → `niet-mogelijk`.
- [ ] Implementeren; checklist; commit `feat: place and cancel orders`.

### Task 2.4: QR-code en mails

**Files:**
- Create: `app/lib/bestellingen/qr.ts`, `app/lib/email/bestellingen.ts`, `app/lib/email/escape.ts`
- Modify: `app/lib/email/mailer.ts` (`attachments`, `replyTo` in `MailMessage`), `package.json` (`qrcode-generator`, `jsqr`)
- Test: `__tests__/lib/bestellingen/qr.test.ts`, `__tests__/lib/email/bestellingen.test.ts`

**Interfaces:**
- `qrSvg(tekst: string): string` (SVG met `role="img"`, quiet zone 4), `qrPng(tekst: string, size = 480): Promise<Buffer>` (sharp), `bestelUrl(token): string` (`${getSiteUrl()}/b/${token}`).
- `stuurBevestiging(order: OrderMetRegels, actie: Actie, site: Site): Promise<void>` en `stuurAfhaalcode(order, actie, site): Promise<void>`; zetten `bevestigingVerstuurdOp` / `qrVerstuurdOp`. Onderwerpen: `Je bestelling voor de <titel> (nr. <n>): zo betaal je`; `Betaling ontvangen: je afhaalcode voor de <titel>`; bij € 0 `Je bestelling voor de <titel> is bevestigd`. Inhoud volgens `MailBevestiging` en `MailQR`, QR als bijlage `cid:afhaalcode`.
- `escapeHtml(text): string`.

- [ ] Tests (Review Focus 5): QR-PNG begint met de PNG-signatuur en jsQR leest `https://…/b/<token>` terug uit het beeld; bevestigingsmail bevat bedrag, geformatteerde IBAN, begunstigde, mededeling, uiterste betaaldatum en de link; cashregel alleen als `cash` in `wijzen`; naam `<b>O'Brien</b>` staat geëscaped in de HTML; QR-mail heeft een bijlage met `cid`.
- [ ] Implementeren; checklist; commit `feat: order mails with QR code`.

### Task 2.5: Publieke pagina's

**Files:**
- Create: `app/(main)/acties/page.tsx`, `app/(main)/acties/[slug]/page.tsx`, `app/(main)/acties/[slug]/actions.ts`, `app/features/bestellen/bestel-formulier.tsx`, `app/features/bestellen/aantal-kiezer.tsx`, `app/features/bestellen/actie-kaart.tsx`, `app/(main)/b/[token]/page.tsx`, `app/(main)/b/[token]/actions.ts`, `app/features/bestellen/bestelstatus.tsx`
- Modify: `app/(main)/page.tsx` en `app/(main)/kalender/page.tsx` (open acties tonen), `app/robots.ts`, `content/teksten/privacybeleid.md` (paragraaf Bestellingen), `content/site.yaml` (geen menu-item; acties via home en kalender)
- Test: `__tests__/features/bestellen/bestel-formulier.test.tsx`, `__tests__/app/acties-page.test.tsx`, `__tests__/app/bestelstatus.test.tsx`, `__tests__/app/robots.test.ts`

**Interfaces:**
- Consumes: Task 2.2–2.4.
- Produces: server action `bestel(state, data)` → `redirect('/b/<token>?besteld=1')` bij succes, anders state met fouten en waarden (zoals `sendContact`); `annuleer(state, data)` met bevestigingsstap via `?annuleren=1` (werkt zonder JavaScript); `BestelFormulier` (client) met `AantalKiezer` (number-input met − en + knoppen, 44px), live overzicht en totaal, dezelfde controle in de browser.
- `/b/[token]`: status-pil (Wacht op betaling / Betaald · klaar om af te halen / Afgehaald / Geannuleerd / Geannuleerd · we storten terug), betaalblok bij `wacht`, QR + korte code bij `betaald`, afhaalmoment, regels, annuleerknop zolang mogelijk. Rate limit op missers (scope `bestelpagina`, 20 per 10 min).

- [ ] Tests: formulier toont producten, uitverkocht en de stepper (− op 0 uitgeschakeld, + stopt op max), totaal telt mee, foutmeldingen onder de velden met `aria-invalid`; `/acties/[slug]` toont "De bestelperiode is voorbij" als gesloten; `/b/[token]` toont het betaalblok bij `wacht` en de QR bij `betaald`, een misvormd token → `notFound`; robots verbiedt `/b/`.
- [ ] Implementeren; handmatig proefbestelling lokaal (dev, mail in de console); checklist; commit `feat: order pages and order status page`; PR 2 openen.

---

## PR 3 — Beheer en 'toegang tot de bankrekening'

### Task 3.1: Vinkje en rechten

**Files:**
- Modify: `app/lib/db/schema.ts` (`users.bankToegang`, migratie), `app/lib/auth/session.ts` (`Session.user.bankToegang`), `app/api/admin/users/route.ts` en `[id]/route.ts`, `app/(admin)/admin/(protected)/gebruikers/users-manager.tsx`, `app/features/admin/admin-sidebar.tsx` (Bestellingen), `proxy.ts`
- Create: `app/lib/bestellingen/rechten.ts`
- Test: `__tests__/api/admin-users-roles.test.ts`, `__tests__/lib/bestellingen/rechten.test.ts`

**Interfaces:** `kanBetalingBevestigen(session): boolean`, `kanBeheren(session): boolean` (admin of redacteur), `kanAfgeven(session): boolean` (admin, redacteur, helper — helper volgt in PR 4).

- [ ] Tests (Review Focus 4): PATCH met `bankToegang` alleen door admin; sessie draagt het vinkje; redacteur zonder vinkje → `kanBetalingBevestigen` false.
- [ ] Implementeren; checklist; commit `feat: bank access flag for users`.

### Task 3.2: Beheerlijst, detail en acties

**Files:**
- Create: `app/lib/bestellingen/beheer.ts`, `app/(admin)/admin/(protected)/bestellingen/page.tsx`, `…/bestellingen/[actie]/page.tsx`, `…/bestellingen/[actie]/[nummer]/page.tsx`, `…/bestellingen/actions.ts`, `app/features/admin/bestellingen/*` (tabel met selectie, filters, statuspil, knoppen)
- Test: `__tests__/lib/bestellingen/beheer.test.ts`, `__tests__/features/admin/bestellingen-tabel.test.tsx`

**Interfaces:**
- `tellers(actie): {bestellingen; betaald; teOntvangenCent; afgehaald}` (geannuleerde tellen niet mee)
- `zoekBestellingen(actie, {status?, afhaalId?, zoek?}): Promise<OrderMetRegels[]>` (zoek op naam, korte code of mededeling, met of zonder `+++`/`/`)
- `markeerBetaald(ids, wijze, door, now): Promise<{gewijzigd: string[]}>` (alleen `wacht`; QR-mail per gewijzigde), `annuleer(id, reden, door)`, `markeerTerugbetaald(id, door)`, `zetNotitie(id, tekst)`, `stuurMailOpnieuw(id, 'bevestiging' | 'afhaalcode')`.
- Server actions controleren `requireEditorSession` + `kanBetalingBevestigen` voor betaald/terugbetaald, en loggen in de audit log.
- Waarschuwing bovenaan als `isVoorbeeldRekening`.

- [ ] Tests: tellers; zoeken op `K7P-4QX`, `k7p4qx` en `+++000/0000/01414+++`; betaald zetten op een geannuleerde bestelling verandert niets; annuleren van `betaald` → `terugbetalen`; terugbetaald → `geannuleerd` + `terugbetaaldOp`; server action 'betaald' zonder vinkje → fout, geen wijziging.
- [ ] Implementeren; checklist; commit `feat: order management`.

### Task 3.3: Productielijst, export en bewaartermijn

**Files:**
- Create: `app/(admin)/admin/(protected)/bestellingen/[actie]/productielijst/page.tsx`, `app/api/admin/bestellingen/[actie]/export/route.ts`, `app/lib/bestellingen/overzicht.ts`, `app/lib/bestellingen/bewaartermijn.ts`
- Modify: `instrumentation.ts` (dagelijkse taak), `CLAUDE.md`
- Test: `__tests__/lib/bestellingen/overzicht.test.ts`, `__tests__/lib/bestellingen/bewaartermijn.test.ts`

**Interfaces:**
- `productielijst(orders): {perMoment: {afhaalId; label; producten: {productId; naam; totaal; varianten: {label; aantal}[]}[]}[]; totaal: …}` ("84 manden, waarvan 9 glutenvrij")
- `naarCsv(orders): string` (`;`-gescheiden voor Excel nl-BE, UTF-8 met BOM, bedragen `12,50`, formule-injectie geneutraliseerd)
- `wisVerlopen(now): Promise<number>` — per actie de laatste `afhaalDatum`; 3 maanden later persoonsgegevens en token leeg, `gewistOp` gezet; `startBestellingenOpruimen()` (nu en elke 24 uur, één keer geregistreerd).

- [ ] Tests (Review Focus 5): productielijst telt varianten per moment; geannuleerd telt niet; CSV met `=SUM()`-naam → `'=SUM()`; wissen laat bedragen en producten staan, raakt een actie met een afhaalmoment 2 maanden geleden niet aan.
- [ ] Implementeren; checklist; commit `feat: production list, CSV export and retention`; PR 3 openen.

---

## PR 4 — Afhaal-app met scanner en de rol helper

### Task 4.1: Rol helper

**Files:**
- Modify: `app/lib/db/schema.ts` (`roles` + `helper`), `app/lib/auth/require-admin.ts` (`requireEditorSession` weigert helper → `/admin/afhalen`; nieuw `requireStaffSession`), `app/lib/auth/api-guard.ts` (`guardEditorApi` weigert helper met 403), `app/lib/auth/session-token.ts` (sessie van een helper 1 dag), `app/api/auth/verify/route.ts` (helper → `/admin/afhalen`), `users-manager.tsx` (rol Helper met uitleg)
- Test: `__tests__/lib/auth/require-admin.test.ts`, `__tests__/api/admin-auth-guard.test.ts`, `__tests__/api/auth-routes.test.ts`

- [ ] Tests (Review Focus 4): helper op een editorpagina → redirect `/admin/afhalen`; helper op `guardEditorApi`-route → 403; helper-cookie verloopt na 1 dag; helper logt in en landt op `/admin/afhalen`.
- [ ] Implementeren; checklist; commit `feat: helper role`.

### Task 4.2: Afhaal-app

**Files:**
- Create: `app/(admin)/admin/(afhalen)/layout.tsx` (app-layout, `requireStaffSession`, eigen manifest `public/afhalen.webmanifest`), `…/afhalen/page.tsx` (actie en moment kiezen), `…/afhalen/[actie]/[moment]/page.tsx` (scanner, teller, zoeken, net meegegeven), `…/afhalen/[actie]/[moment]/[token]/page.tsx` (afgifte), `…/afhalen/actions.ts`, `app/features/afhalen/scanner.tsx` (BarcodeDetector, fallback `jsqr` via dynamische import), `app/features/afhalen/afgifte.tsx`, `app/lib/bestellingen/afhalen.ts`
- Modify: `app/(main)/b/[token]/page.tsx` (ingelogd lid → afgiftescherm), `proxy.ts`
- Test: `__tests__/lib/bestellingen/afhalen.test.ts`, `__tests__/features/afhalen/scanner.test.tsx`, `__tests__/features/afhalen/afgifte.test.tsx`

**Interfaces:**
- `afhaalTeller(actie, afhaalId): {afgehaald; totaal}` (totaal = niet-geannuleerd)
- `geefMee(orderId, door, now): Promise<{status: 'meegegeven'} | {status: 'al-afgehaald'; op: Date; door: string} | {status: 'niet-betaald'; openCent: number} | {status: 'geannuleerd'}>` — één voorwaardelijke update, zet alle regels `meegegeven`
- `ontvangCash(orderId, door, now)` (alleen met vinkje; daarna afgifte)
- `zoekVoorAfhalen(actie, tekst): {token; nummer; naam; korteCode; status; afhaalLabel}[]` (geen e-mail, telefoon of bedragen)
- `leesTokenUitQr(tekst, origin): string | undefined` (alleen `/b/<token>` van de eigen site)
- Waarschuwingen op het afgiftescherm: "Nog niet betaald: € 32,00", "Al afgehaald om 17:42 door Sara", "Ander afhaalmoment: zaterdag 23 januari", "Geannuleerd".

- [ ] Tests (Review Focus 3): tweede `geefMee` → `al-afgehaald` met tijd en naam; `wacht` → `niet-betaald` met open bedrag, niets gewijzigd; teller telt geannuleerd niet mee; `leesTokenUitQr` weigert een andere host; scanner valt terug op jsQR zonder `BarcodeDetector`; afgiftescherm toont geen e-mail of telefoon.
- [ ] Implementeren; op een telefoon (of Chrome device mode) scannen proberen; checklist; commit `feat: pickup app with scanner`; PR 4 openen.

### Task 4.3: Afronden

**Files:** `CLAUDE.md` (stap 7 bestelsysteem, open punten, fase 2), design system "Talentenraad Beverst" (README-paragraaf Bestelsysteem; componenten AantalKiezer, StatusPil, Betaalblok, Afgifte), `docs/handleiding-editor.md` (acties, afhaal-app, betalingen).

- [ ] Bijwerken; checklist; commit `docs: bestelsysteem`.
