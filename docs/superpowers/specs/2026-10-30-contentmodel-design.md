# Contentmodel in `content/` (stap 2 van de revival)

Status: ontwerp, ter goedkeuring door Tom · 2026-10-30

## Waarom

De site hangt voor alle content aan Builder.io. De revival (zie `CLAUDE.md`) haalt die SaaS weg: content wordt Markdown met frontmatter in deze repo, zodat Claude er zelfstandig mee kan werken en een lichte admin-editor (stap 6) wijzigingen van niet-technische ouders als GitHub-commits kan wegschrijven.

Stap 1 heeft alles uit Builder.io veiliggesteld in `content-export/` (JSON per model + 4 afbeeldingen). Die map staat **alleen lokaal** (gitignored): ze bevat namen van oud-leden en een privé-e-mailadres, en de repo is publiek. Er geldt een content freeze in Builder.io tot stap 3: de migratie draait één keer. Deze stap legt vast hoe die content er in `content/` uitziet, valideert ze met schema's, en zet ze er met een script in.

## Doelen

- Elke stuk content dat de huidige site toont, staat in `content/` als Markdown/YAML met een gevalideerd schema.
- Eén migratiescript zet `content-export/` om naar `content/`, herhaalbaar tot we het resultaat committen.
- Een typed loader (`app/lib/content/`) die de rest van de app in stap 3 gebruikt.
- In `content/` komt alleen wat de site vandaag publiek toont: geen inactieve teamleden of helpers.
- Een test die alle content tegen de schema's valideert, zodat een kapotte editor-commit in CI faalt in plaats van in productie.
- Bestandsstructuur is eenvoudig genoeg dat de editor van stap 6 ze kan lezen en schrijven zonder speciale gevallen per pagina.

## Niet-doelen

- Pagina's omzetten naar de nieuwe loader (stap 3). In deze stap verandert niets aan wat de site rendert.
- Builder-code verwijderen (stap 3).
- De editor zelf (stap 6), live preview of content zonder rebuild.

## Anti-doelen

- Ouders kunnen de **opbouw** van pagina's aanpassen (blokken toevoegen, verschuiven, varianten kiezen). Expliciet niet gewenst (Tom): opbouw zit vast in code, ouders bewerken alleen teksten.
- Code of componenten in content (MDX, shortcodes). Content blijft data.
- Opmaak-knoppen in content: `variant`, `color`, `size`, `columns`, `limit`, `showArrow` e.d. uit Builder verdwijnen naar de templates in code.

## Gekozen aanpak

**Content wordt ingebakken bij de build** (Tom: "initieel het eenvoudigste"). Een commit op `content/` laat de GitHub Action van stap 5 een nieuw image bouwen en uitrollen; een wijziging staat na enkele minuten online. Pagina's worden statisch gegenereerd; `revalidate`-polling verdwijnt (stap 3).

Overwogen en (voorlopig) niet gekozen:

| Aanpak | Afweging |
|---|---|
| **A. Inbakken bij build** (gekozen) | Eenvoudigst, statisch en snel, niets extra op de VPS. Wijziging pas na deploy (~3–5 min) online. |
| B. Live lezen van schijf | Wijziging in seconden online via `git pull` + `revalidatePath`, maar extra bewegende delen op de VPS en een eigen afbeeldingsroute. |
| C. Inbakken + live preview in editor | Ouders zien wijziging meteen in preview; twee leespaden onderhouden. |

B of C blijven later mogelijk: de loader leest bestanden van schijf, dat verandert niet.

Inlezen gebeurt met een eigen kleine loader (`gray-matter` + `zod` + `remark`/`rehype`), geen framework. Contentlayer wordt niet meer onderhouden; MDX laat code toe in content (anti-doel).

## Structuur

```
content/
  site.yaml                        # header, footer, sitebrede CTA, aankondiging
  paginas/                         # vaste templates; één schema per bestand
    home.md
    kalender.md
    nieuws.md
    contact.md
    over-ons.md
    sponsors.md
  teksten/                         # vrije tekstpagina's, via de catch-all route
    privacybeleid.md
    cookiebeleid.md
    algemene-voorwaarden.md
  activiteiten/<slug>/index.md     # + optioneel afbeelding(en) in dezelfde map
  nieuws/<slug>/index.md           # idem
  team/<slug>/index.md             # + optioneel foto
  faq/<slug>.md
```

Regels die voor alles gelden:

- **Veldnamen in het Nederlands**, zoals in Builder (`titel`, `datum`, `samenvatting`): ouders zien ze in de editor.
- **Lopende tekst staat in de Markdown-body**, korte velden in frontmatter.
- **Afbeeldingen staan naast het item** in de map, en de frontmatter verwijst relatief: `afbeelding: ./foto.jpg`. De editor commit tekst en foto samen.
- **Mapnaam of bestandsnaam = slug = URL.**
- **`concept: true`** (optioneel, overal) verbergt een item in productie; vervangt Builder's draft/published.

### `site.yaml`

Voegt de Builder-modellen `site-header`, `site-footer`, `footer-cta`, `navigation-list`, `grouped-navigation-list`, `aankondiging` en `announcement-bar` samen tot één bestand.

```yaml
navigatie:            # hoofdmenu
  - {tekst: Home, link: /}
  - {tekst: Kalender, link: /kalender}
footer:
  tagline: "De ouderraad van Het Talentenhuis\nSchool met een hart voor ieder kind"
  adres: {straat: Zonhoevestraat 32, gemeente: 3740 Bilzen-Hoeselt}
  email: voorzitterouderraad@talentenhuis.be
  groepen:
    - titel: Navigatie
      links: [{tekst: Home, link: /}]
  sociaal:
    - {platform: facebook, link: https://facebook.com/talentenhuis}
  copyright: Talentenraad Het Talentenhuis. Alle rechten voorbehouden.
cta:                  # sitebrede banner boven de footer
  titel: Vragen of ideeën?
  tekst: Neem contact op met de Talentenraad. We horen graag van je!
  knop: {tekst: Contact opnemen, link: /contact}
decoraties:          # seizoensversiering, nu in Postgres `site_settings` + admin-scherm "decoraties"
  …                   # velden 1-op-1 uit de huidige instelling
aankondiging:
  actief: false
  tekst: …
  type: info          # info | waarschuwing | feest (enum volgt bestaande component)
  link: …             # optioneel
```

Het logo (`/Logo.png`) is geen content en blijft in code.

### `paginas/*.md` — vaste templates

Elke pagina heeft een eigen zod-schema. Gemeenschappelijk:

```yaml
titel: …              # <title> en SEO
beschrijving: …       # meta description
hero: {titel: …, ondertitel: …}
cta:                  # de afsluitende banner (optioneel per pagina)
  titel: …
  tekst: …
  knoppen: [{tekst: …, link: …}]   # 1 of 2
```

Per pagina daarbovenop (velden volgen de teksten die nu in Builder staan):

| Pagina | Extra velden | Body |
|---|---|---|
| `home` | `dashboardTitel` ("In een oogopslag"), `infokaart.titel`, `faqTitel` | tekst van de infokaart |
| `kalender` | `lijst.titel`, `lijst.ondertitel`, `archief.titel`, `archief.ondertitel` | — |
| `nieuws` | — | — |
| `contact` | `formulier.titel`, `formulier.tekst`, `infokaart.titel` | tekst van de infokaart (contactgegevens) |
| `over-ons` | `infokaart.titel`, `bestuur.titel`, `bestuur.tekst`, `leden.titel`, `leden.tekst` | tekst van de infokaart (missie) |
| `sponsors` | `sponsors: [{naam, niveau, link?, logo?}]` met `niveau` ∈ goud/zilver/brons/partner, `legeTekst` per niveau | — |

Sponsors staan nu als vier lege secties in Builder ("Nog geen gouden sponsors…"); als lijst kunnen ouders er later een toevoegen met logo zonder iets aan de opbouw te veranderen. De logo's staan dan in `content/paginas/sponsors/` (pagina wordt een map zodra er een logo is; de loader ondersteunt `sponsors.md` en `sponsors/index.md`).

### `teksten/*.md` — vrije tekstpagina's

```yaml
titel: Privacybeleid
beschrijving: …
```
Body = de volledige tekst. Geserveerd door de bestaande catch-all `app/(main)/[...page]`. Nieuwe tekstpagina's kunnen ouders zelf aanmaken.

### Collecties

**`activiteiten/<slug>/index.md`**
```yaml
titel: De Talentenfuif 2025 komt eraan!
datum: 2025-02-07
tijd: "20:00 - 01:00"       # vrije tekst, zoals nu
locatie: …
categorie: feest            # enum uit huidige data/component
samenvatting: …
afbeelding: ./afbeelding.jpg   # optioneel
```
Body = `inhoud` (HTML → Markdown).

**`nieuws/<slug>/index.md`**: `titel`, `datum`, `samenvatting`, `afbeelding?`; body = `inhoud`.

**`team/<slug>/index.md`**: `naam`, `rol`, `categorie` (bestuur | lid), `volgorde` (getal, standaard 99), `foto?`; body = optionele `beschrijving` (nu alleen bij het bestuur). Alleen actieve leden worden gemigreerd; wie stopt, wordt verwijderd in plaats van op inactief gezet (publieke repo). Daarom geen `actief`-veld. Een map ook zonder foto, zodat de editor later een foto kan toevoegen zonder het item te verplaatsen.

**`faq/<slug>.md`**: `vraag`, `volgorde`; body = antwoord.

## Slugs en URL's

Huidige URL's van activiteiten en nieuws komen uit `generateSlug(titel)` (vijf kopieën in `app/features/`). Die geeft bij "🎉 De Talentenfuif 2025 komt eraan!" een slug met een leidend streepje. Het migratiescript maakt een schone slug (zelfde functie, plus streepjes aan begin/eind weghalen, emoji weg). Waar die verschilt van de oude, schrijft het de oude in frontmatter als `aliassen: [oude-slug]`; stap 3 laat de route daarvoor een permanente redirect geven. Eén gedeelde `slugify` komt in `app/lib/content/`.

## Afbeeldingen in de build

Afbeeldingen staan in `content/`, niet in `public/`. Een `prebuild`-script kopieert ze naar `public/content/<zelfde pad>` (gitignored), en de loader herschrijft `./foto.jpg` naar `/content/activiteiten/<slug>/foto.jpg`, met breedte en hoogte erbij (`image-size`) zodat `next/image` werkt zonder layout shift. `npm run dev` draait hetzelfde script.

## Loader — `app/lib/content/`

- `schemas.ts`: zod-schema per collectie, per pagina, voor `site.yaml` en voor tekstpagina's. Types via `z.infer`.
- Functies, alleen server-side: `getSite()`, `getPagina('home')` (typed per paginanaam), `getTekst(slug)`, `listTeksten()`, `getActiviteiten()`, `getActiviteit(slug)`, idem nieuws, `getTeam()`, `getFaq()`.
- Markdown-body wordt HTML via `remark` → `rehype` → `rehype-sanitize` (ouders typen de content; sanitizen is goedkoop).
- `concept: true` wordt weggefilterd behalve met `NODE_ENV=development`.
- Sortering: activiteiten op `datum`, nieuws op `datum` aflopend, team en faq op `volgorde` dan naam.
- Een ongeldig bestand gooit een fout met bestandspad en zod-melding: de build faalt, de site gaat niet stuk online.

## Migratiescript — `scripts/migrate-content.mjs`

- Leest de lokale `content-export/*.json` en `_assets.json`, schrijft `content/` opnieuw (wist eerst `content/`). Draait één keer (content freeze).
- Neemt alleen gepubliceerde entries en alleen teamleden met `actief: true`; onderdelen zonder data (de 23 lege sectiemodellen, de Builder-trackingpixel) slaat het over.
- Pagina-teksten haalt het uit de block-boom van `page.json` per URL; `Typography`/`Text`-blokken worden velden volgens de tabel hierboven.
- HTML (`inhoud`, `Text`-blokken, `antwoord`) → Markdown met `turndown`.
- Persoonlijke e-mailadressen van ouders gaan eruit (Tom): in "Moederdag Ontbijtmanden 2025" verdwijnt de regel "Contact: <persoonlijk e-mailadres van een ouder>"; de rest van de tekst (rekeningnummer, mededeling) blijft. Het script faalt als er na migratie nog een e-mailadres in `content/` staat buiten een allowlist (`voorzitterouderraad@talentenhuis.be`, `contact@apd-gba.be`).
- Afbeeldingen: Builder-URL → bestand via `_assets.json`, gekopieerd naar de map van het item.
- Na schrijven valideert het alles met dezelfde zod-schema's (via de loader) en meldt het wat het niet kon plaatsen.
- Na de commit van `content/` heeft het script zijn werk gedaan; het script gaat weg in stap 3, de lokale `content-export/` mag Tom bewaren of wissen.

## Testen

- Jest: schema's (geldig/ongeldig), slugify (incl. emoji-geval), loader op een kleine fixture-map, beeldpad-herschrijving.
- `content.test.ts`: laadt de échte `content/` en valideert alles. Draait in de pre-commit hook en CI, dus ook op editor-commits.
- Handmatige controle na migratie: elke huidige pagina-tekst, 4 activiteiten, 2 nieuws, 20 teamleden, 2 faq terug te vinden in `content/`.

## Aan de bouwer

- Exacte enums voor `categorie` en `aankondiging.type`: afleiden uit bestaande componenten en data.
- Precieze veldnamen in de paginatabel mogen aangepast worden als de huidige teksten anders blijken te passen, zolang het schema per pagina blijft.
- Keuze tussen `remark`-plugins, en of `turndown` nog nabewerking nodig heeft.
- Verdeling in commits.

## Mijn keuzes (Claude), ter controle

- `paginas/` vs `teksten/` als aparte mappen, zodat de editor weet wat vaste velden heeft en wat vrije tekst is.
- Collecties met afbeeldingen als map per item; faq als los bestand.
- `concept: true` als vervanger van Builder-drafts.
- `aliassen` + redirect voor slugs die veranderen.
- Afbeeldingen via `prebuild`-kopie naar `public/content/`.
- Seizoensversiering naar `site.yaml` (`decoraties`) i.p.v. de database.
- `rehype-sanitize` op Markdown-body.
- Schema's en loader in stap 2 (ze definiëren het model), pagina's aansluiten in stap 3.
