# Bestelsysteem fase 2: minder handwerk

**Goal:** het bestuur en de helpers minder handwerk geven rond een actie, zonder nieuwe externe diensten. Fase 1 (bestellen tot afhalen) is af en live sinds 8 november 2026; de eerste echte actie is de pizzaverkoop in januari 2027.

**Spec:** [Bestelsysteem voor acties](https://claude.ai/artifact/VSUZokvGPrTwWmHTNzE6Pu), sectie Fasering. Fase 3 (online betalen) staat er als "voorlopig niet gepland".

**Plan fase 1:** `docs/superpowers/plans/2026-11-05-bestelsysteem.md` (regels over statussen, privacy, mails en repo-regels gelden hier ook).

## Volgorde

Eerst wat vóór januari het meeste helpt en niets van buiten nodig heeft. Elk onderdeel is een eigen PR, groen op lint, type-check, tests (coverage ≥ 50%) en build.

| PR | Onderdeel | Nodig van buiten | Status |
| --- | --- | --- | --- |
| 6 | Afhaallijst printen | niets | klaar |
| 7 | Herinneringsmails (betalen, afhalen) | niets | klaar |
| 8 | Handmatige bestellingen | niets | klaar |
| 9 | ~~Gedeeltelijke afgifte~~ | | vervalt (zie Beslissingen) |
| 10 | Bankafschrift inlezen (KBC) | een voorbeeld-CSV van KBC | wacht op de CSV |
| 11 | ~~Offline reserve in de afhaal-app~~ | | vervalt: de afhaallijst (PR 6) is de reserve |

---

## PR 6: Afhaallijst printen

De reserve als de telefoons het laten afweten: per afhaalmoment alle bestellingen, alfabetisch, met een vakje om af te vinken.

**Files:**
- Create: `app/(admin)/admin/(protected)/bestellingen/[actie]/afhaallijst/page.tsx`
- Modify: `app/lib/bestellingen/overzicht.ts` (`afhaallijst`), `app/(admin)/admin/(protected)/bestellingen/[actie]/page.tsx` (knop naast Productielijst), `proxy.ts` (pad)
- Test: `__tests__/lib/bestellingen/overzicht.test.ts`

**Interfaces:**
- `afhaallijst(orders): Array<{afhaalId; label; plaats; rijen: Array<{nummer; naam; kind?; korteCode; producten: string; status: 'betaald' | 'wacht' | 'afgehaald'; afgehaaldOm?}>}>`, momenten op datum, rijen op naam zoals ingevuld (voornaam eerst; `Intl.Collator` nl-BE, hoofdletters en accenten tellen niet); geannuleerd en terug te betalen tellen niet.
- Producten in één regel: "2 × Margherita, 1 × Ontbijtmand (glutenvrij)" (`regelNaam`).

**Regels:**
- Alleen admin en redacteur (`requireEditorSession`). Op de lijst staat geen e-mail, telefoon of bedrag: de lijst ligt op de afhaaltafel, waar ook helpers hem zien. Een niet-betaalde bestelling krijgt "Niet betaald", zonder bedrag.
- Elk afhaalmoment begint op een nieuwe pagina; de kop (actie, moment, plaats, "Stand van …") staat boven elke lijst. Een vakje van 6 mm per rij, afgehaalde rijen al aangevinkt met het uur.
- Een filter `?moment=<id>` om één moment te printen.

- [x] Tests: volgorde op naam (kleine letters en accenten), geannuleerd valt weg, niet betaald zonder bedrag, keuzes in de productregel, kind erbij als gevraagd.
- [x] Implementeren; checklist; afdrukweergave bekeken (paginasprong per moment, gelijke kolommen); PR openen.

## PR 7: Herinneringsmails

Twee mails die vanzelf vertrekken, elk hoogstens één keer per bestelling.

**Files:**
- Modify: `app/lib/db/schema.ts` (`betaalHerinneringOp`, `afhaalHerinneringOp` op `orders`) + migratie via `npm run db:generate`, `app/lib/email/bestellingen.ts` (twee mails), `app/lib/bestellingen/mails.ts` (versturen), `instrumentation.ts`
- Create: `app/lib/bestellingen/herinneringen.ts`
- Test: `__tests__/lib/bestellingen/herinneringen.test.ts`, `__tests__/lib/email/bestellingen.test.ts`

**Wanneer:**
- **Betalen:** status `wacht`, de dag vóór de uiterste betaaldatum of op die dag zelf (als de server de dag ervoor niet draaide), alleen als de bestelling van vóór vandaag is. Inhoud: dezelfde betaalgegevens als mail 1, met "Nog niet betaald?" als kop. Is er intussen betaald, dan zegt de mail dat die vervalt.
- **Afhalen:** status `betaald`, de dag vóór het afhaalmoment, alleen als de QR-mail niet vandaag vertrok. Inhoud: moment, plaats, producten en dezelfde QR-code (inline PNG).
- Een actie die niet meer in `content/` staat of een gewiste bestelling (geen token) krijgt niets.

**Hoe:**
- `teHerinneren(now): Promise<{betalen: string[]; afhalen: string[]}>` (pure selectie op datum en status), `stuurHerinneringen(now)` verstuurt en zet de kolom pas ná een gelukte verzending, zodat een mislukte mail de volgende ronde opnieuw probeert.
- Een taak elk uur (zoals `startBewaartermijn`), die alleen tussen 9 en 20 uur Belgische tijd verstuurt: geen mail om middernacht.
- Een kolom per soort, gezet met een voorwaardelijke update (`WHERE ... IS NULL`), zodat een herstart of twee rondes nooit twee mails geven.

- [x] Tests: dag ervoor en dag zelf wel, twee dagen ervoor en de dag erna niet; niet buiten 9–20 uur (ook in zomertijd); betaald krijgt geen betaalherinnering; tweede ronde stuurt niets; mislukte mail zet de kolom niet en volgt de volgende ronde; geannuleerd en gewist krijgen niets; HTML-escaping van productnamen. Draaien in vier tijdzones.
- [x] Implementeren; checklist; beide mails gerenderd en bekeken; het beheer toont wanneer ze vertrokken; PR openen.

---

## PR 8: Handmatige bestellingen

Voor een ouder zonder e-mailadres, of die aan de schoolpoort bestelt en cash betaalt: het bestuur voert de bestelling zelf in.

**Files:**
- Modify: `app/lib/db/schema.ts` (`ingevoerdDoor` op `orders`) + migratie, `app/lib/bestellingen/plaatsen.ts` (bewaren gedeeld met de online bestelling), `formulier.ts` (e-mail optioneel), `mails.ts` en `herinneringen.ts` (niets naar een lege e-mail), `proxy.ts` (pad), de beheerpagina van een actie (knop) en de detailpagina (ingevoerd door; geen "opnieuw mailen" zonder e-mail)
- Create: `app/lib/bestellingen/handmatig.ts`, `app/(admin)/admin/(protected)/bestellingen/[actie]/nieuw/` (pagina en server action), `app/features/admin/bestellingen/handmatige-bestelling.tsx`
- Test: `__tests__/lib/bestellingen/handmatig.test.ts`, `mails.test.ts`, `herinneringen.test.ts`, `formulier.test.ts`

**Regels:**
- Alleen admin en redacteur (`requireEditorSession`), op `/admin/bestellingen/<actie>/nieuw`.
- Velden: naam (verplicht), e-mail en telefoon (optioneel), kind en klas als de actie erom vraagt, afhaalmoment, aantallen en een notitie. Het vinkje "Cash betaald" alleen met `bankToegang`, ook server-side gecontroleerd.
- Dezelfde controles als online (voorraad in dezelfde `BEGIN IMMEDIATE`-transactie, maximum per bestelling, kind en klas), maar zonder bestelperiode, honeypot, tijdscontrole of rate limit: ook een late bestelling aan de schoolpoort kan.
- Zonder e-mail blijft `email` leeg, zoals bij een gewiste bestelling, en vertrekt er geen enkele mail (bevestiging, afhaalcode, herinneringen). Met e-mail krijgt de ouder dezelfde mails als online.
- Geen briefje en geen QR: aan de afhaaltafel zoekt de helper op naam of nummer in de afhaal-app, en de bestelling staat op naam op de afhaallijst.
- `ingevoerdDoor` (naam van wie hem invoerde) op de bestelling; het beheer toont het, de audit log krijgt een `create`.

- [x] Tests: zonder e-mail geen mail, met e-mail wel; cash betaald zet `betaald` met `cash`/`manueel` en wie; buiten de bestelperiode kan het; voorraad en maximum gelden; een ongeldig e-mailadres wordt geweigerd, een leeg niet; `ingevoerdDoor` gezet; herinneringen en de afhaalcode slaan een lege e-mail over.
- [x] Implementeren; checklist; lokaal een bestelling ingevoerd en in de afhaal-app teruggevonden op naam; PR openen.

---

## Beslissingen (9 november 2026)

1. **Handmatige bestelling:** geen briefje; naam en nummer op de afhaallijst volstaan. Wie toegang tot de bankrekening heeft, mag zo'n bestelling meteen als cash betaald zetten. → PR 8.
2. **Gedeeltelijke afgifte:** niet nodig; alles of niets blijft. PR 9 vervalt tot een actie (bv. fuifkaarten) het echt nodig heeft.
3. **Bankafschrift:** de rekening staat bij KBC. PR 10 wacht op een voorbeeldexport (CSV) van KBC, met namen en bedragen vervangen door nepgegevens.
4. **Offline reserve:** de afgedrukte afhaallijst (PR 6) volstaat. PR 11 vervalt; offline meegeven zou dezelfde bestelling twee keer kunnen laten meegeven.
