# Bestelsysteem fase 2: minder handwerk

**Goal:** het bestuur en de helpers minder handwerk geven rond een actie, zonder nieuwe externe diensten. Fase 1 (bestellen tot afhalen) is af en live sinds 8 november 2026; de eerste echte actie is de pizzaverkoop in januari 2027.

**Spec:** [Bestelsysteem voor acties](https://claude.ai/artifact/VSUZokvGPrTwWmHTNzE6Pu), sectie Fasering. Fase 3 (online betalen) staat er als "voorlopig niet gepland".

**Plan fase 1:** `docs/superpowers/plans/2026-11-05-bestelsysteem.md` (regels over statussen, privacy, mails en repo-regels gelden hier ook).

## Volgorde

Eerst wat vóór januari het meeste helpt en niets van buiten nodig heeft. Elk onderdeel is een eigen PR, groen op lint, type-check, tests (coverage ≥ 50%) en build.

| PR | Onderdeel | Nodig van buiten | Status |
| --- | --- | --- | --- |
| 6 | Afhaallijst printen | niets | klaar |
| 7 | Herinneringsmails (betalen, afhalen) | niets | dit plan |
| 8 | Handmatige bestellingen | beslissing (zie Open vragen) | later |
| 9 | Gedeeltelijke afgifte | beslissing | later |
| 10 | Bankafschrift inlezen | een voorbeeld-CSV van de bank | later |
| 11 | Offline reserve in de afhaal-app | beslissing | later |

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

- [ ] Tests: dag ervoor en dag zelf wel, twee dagen ervoor en de dag erna niet; niet buiten 9–20 uur; betaald krijgt geen betaalherinnering; tweede ronde stuurt niets; mislukte mail zet de kolom niet; geannuleerd en gewist krijgen niets; HTML-escaping van de naam in beide mails.
- [ ] Implementeren; checklist; mails lokaal in de console bekijken; PR openen.

---

## Open vragen (beslist de Talentenraad)

1. **Handmatige bestelling:** krijgt een ouder zonder e-mailadres een afgedrukt briefje met de QR-code, of volstaan naam en nummer op de afhaallijst? Mag het bestuur zo'n bestelling meteen als cash betaald zetten?
2. **Gedeeltelijke afgifte:** per product een aantal "nu meegegeven", en blijft de bestelling dan open tot alles mee is? Of alleen voor kaarten (fuif), niet voor pizza's?
3. **Bankafschrift:** bij welke bank staat de rekening? We hebben een voorbeeldexport (CSV) nodig, met namen en bedragen vervangen door nepgegevens, om het formaat te kennen.
4. **Offline reserve:** volstaat de afgedrukte afhaallijst (PR 6) als reserve, of moet de afhaal-app ook zonder verbinding kunnen meegeven? Offline meegeven kan dezelfde bestelling twee keer laten meegeven als twee telefoons tegelijk offline zijn.
