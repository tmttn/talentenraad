# Handleiding: de site bewerken

Met de editor pas je zelf de inhoud van talentenraad.be aan. Je hebt geen technische kennis nodig.

## Inloggen

1. De beheerder nodigt je uit. Je krijgt een e-mail van `noreply@talentenraad.be`.
2. Ga naar [talentenraad.be/admin](https://talentenraad.be/admin), vul je e-mailadres in en klik op de link in de mail. De link werkt één keer en 15 minuten lang.
3. Kies links **Content**.

Geen mail gekregen? Kijk in je spam, of vraag de beheerder om je uitnodiging opnieuw te versturen.

## Wat je kunt bewerken

- **Activiteiten**: titel, datum, tijd, locatie, categorie, samenvatting, tekst en een afbeelding.
- **Acties**: een verkoop waarvoor ouders online bestellen (pizza's, ontbijtmanden, fuifkaarten). Zie hieronder.
- **Nieuws**: titel, datum, samenvatting, tekst en een afbeelding.
- **Team**: naam, rol, categorie (bestuur of lid), volgorde, een korte tekst en een foto.
- **Veelgestelde vragen**: vraag, antwoord en volgorde.
- **Aankondiging**: de balk bovenaan de site, met een soort (info, waarschuwing of belangrijk), een korte tekst en eventueel een link.

Bij **Volgorde** komen lagere nummers eerst; leeg betekent helemaal achteraan.

## Een actie opzetten

Een actie heeft, naast titel, samenvatting, beschrijving en afbeelding:

- **Bestellen vanaf** en **Bestellen tot en met**: in die periode staat het bestelformulier open. Daarna sluit het vanzelf, en kunnen ouders ook niet meer zelf annuleren.
- **Betalen binnen (dagen)**: de uiterste betaaldatum, gerekend vanaf de dag van bestellen.
- **Betalen**: overschrijving (met een gestructureerde mededeling per bestelling) en/of cash.
- **Rekeningnummer (IBAN)** en **Op naam van**: de rekening waarop ouders voor deze actie betalen. Kijk het nummer goed na: elke ouder krijgt het in de mail. De site controleert of het een geldig rekeningnummer is, maar niet of het het juiste is.
- **Afhaalmomenten**: datum, uur (bv. `17:00 - 19:00`) en plaats. Ouders kiezen er één.
- **Producten**: naam, prijs in euro (bv. `12,50`), eventueel wat erin zit, een voorraad (leeg = onbeperkt) en een maximum per bestelling (leeg = 10).
- **Opties** bij een product, bv. Brood met de keuzes Wit, Bruin en Glutenvrij (+ 2,00). Ouders kiezen dan per stuk.

Tips:

- Zet een nieuwe actie eerst als **Concept**: dan staat ze nog niet op de site.
- Pas na de eerste bestelling geen producten meer weg of aan als het kan: een bestelling onthoudt naam en prijs zoals ze waren, maar de productielijst telt per product.

## Bestellingen opvolgen

Links onder **Bestellingen** zie je per actie hoeveel bestellingen er zijn, hoeveel betaald, hoeveel geld er nog moet binnenkomen en hoeveel er al afgehaald is. Je zoekt op naam, bestelnummer, korte code (`K7P-4QX`) of mededeling.

- **Betaald zetten**: vink de bestellingen aan waarvan het geld op de rekening staat, kies bij **Betaald met** overschrijving of cash en klik op **Markeer als betaald en stuur QR-code**. De ouder krijgt dan een mail met de QR-code om af te halen. Alleen wie in **Gebruikers** het vinkje **Toegang tot de bankrekening** heeft, ziet de vinkjes en deze knop (en **Markeer als terugbetaald** en, in de afhaal-app, cash ontvangen).
- **Annuleren**: met een reden. Was de bestelling al betaald, dan komt ze op de lijst **Terug te betalen**; klik op **Markeer als terugbetaald** zodra het geld teruggestort is.
- **Productielijst**: hoeveel van elk product (en elke keuze) per afhaalmoment. Handig voor de bakker of de inkoop; je kunt hem afdrukken.
- **Export CSV**: alle bestellingen als bestand voor Excel.

Na drie maanden na het laatste afhaalmoment worden namen, e-mailadressen en telefoonnummers van een actie automatisch gewist. Bedragen en aantallen blijven.

## Afhalen met de telefoon

Op het afhaalmoment geef je de bestellingen mee met je telefoon.

1. Open [talentenraad.be/admin/afhalen](https://talentenraad.be/admin/afhalen) op je telefoon en log in. Tip: zet de pagina op je beginscherm (in Safari: deel-knop, **Zet op beginscherm**).
2. Kies de actie en het afhaalmoment waar je helpt.
3. Tik op **Camera starten** en richt op de QR-code van de ouder (op hun telefoon of afgedrukt). Lukt scannen niet, zoek dan op naam, nummer of de code van zes tekens onder de QR-code.
4. Je ziet de naam en de producten in grote letters. Geef alles mee, vink eventueel af wat je al gaf, en tik op **Alles meegegeven**.

Let op de melding bovenaan:

- **Betaald · juist afhaalmoment** (groen): je mag meegeven.
- **Nog niet betaald** (rood): geef niets mee. Verwijs de ouder naar wie de betalingen beheert. Heb je zelf toegang tot de bankrekening, dan kun je het bedrag cash ontvangen en daarna meegeven.
- **Al afgehaald om 17:42 door …** (rood): iemand gaf deze bestelling al mee. Geef niets meer mee.
- **Geannuleerd** (rood): geef niets mee.
- **Ander afhaalmoment** (oker): de bestelling hoort bij een ander moment. Meegeven mag als het voor jullie in orde is.

Bovenaan zie je hoeveel bestellingen al afgehaald zijn, en onderaan welke je net meegaf.

### Helpers

Wie alleen komt helpen bij het afhalen, krijgt in **Gebruikers** de rol **Helper**. Een helper ziet alleen de afhaal-app: naam en producten van de bestelling die gescand wordt, nooit e-mailadressen of telefoonnummers. De login van een helper geldt één dag; op een geleende telefoon hoef je dus niet af te melden (al mag het wel).

## Iets toevoegen of aanpassen

1. Kies het soort inhoud en klik op de knop om iets toe te voegen, of op **Bewerken** bij een bestaand item.
2. Vul de velden in. Velden die verplicht zijn, krijgen een melding als ze leeg zijn.
3. Schrijf de tekst in het grote tekstvak. Je kunt opmaak gebruiken:
   - `**vet**` wordt **vet**
   - `*schuin*` wordt *schuin*
   - een regel die begint met `- ` wordt een opsomming
   - `[tekst van de link](https://voorbeeld.be)` wordt een link

   Onder **Voorbeeld** zie je meteen hoe het eruitziet.
4. Een afbeelding of foto kies je van je computer of gsm (jpg, png of webp, tot 10 MB). De site verkleint ze automatisch en haalt locatiegegevens uit de foto.
5. Vink **Concept** aan als het nog niet op de site mag staan.
6. Klik op **Opslaan**.

## Wat er na opslaan gebeurt

Je ziet "Opgeslagen. Je wijziging staat over ongeveer 3 minuten online." De site wordt dan opnieuw opgebouwd. Daaronder zie je hoe ver dat staat:

- **Bezig met online zetten…**: even geduld.
- **Online**: je wijziging staat op de site. Herlaad de pagina als je ze nog niet ziet.
- **Online zetten mislukt**: je wijziging is bewaard, maar staat nog niet op de site. De beheerder ziet wat er misliep; je hoeft niets opnieuw te doen.

Elke wijziging wordt bewaard met een historiek. Een vergissing is dus altijd terug te draaien door de beheerder.

## Verwijderen

Open het item, klik op **Verwijderen** en bevestig met **Ja, verwijderen**. Ook dit staat na ongeveer 3 minuten online. Wil je iets alleen tijdelijk verbergen, vink dan liever **Concept** aan.

## Meldingen

- **Iemand anders heeft dit net aangepast. Herlaad de pagina.** Twee mensen bewerkten hetzelfde tegelijk. Herlaad, controleer de tekst en sla opnieuw op.
- **Er bestaat al een item met deze titel.** Kies een andere titel.
- **Kies de foto opnieuw.** Na een foutmelding moet je de foto opnieuw kiezen.
- **Bewerken is nog niet ingesteld.** De koppeling ontbreekt; meld het aan de beheerder.

## Privacy

Zet geen persoonlijke gegevens van kinderen of ouders op de site zonder toestemming: geen telefoonnummers, privé-e-mailadressen of herkenbare foto's van kinderen zonder akkoord van hun ouders.
