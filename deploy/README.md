# Uitrol naar Hetzner

De site draait als Docker-container op een kleine VPS, met Caddy ervoor voor HTTPS. GitHub Actions bouwt en rolt uit (`.github/workflows/deploy.yml`).

## Indeling op de server

Alles staat in `/opt/talentenraad/`, eigendom van de gebruiker `deploy` (lid van de groep `docker`):

| Bestand | Herkomst |
| --- | --- |
| `compose.yaml` | wordt bij elke deploy gekopieerd uit de repo |
| `Caddyfile` | wordt bij elke deploy gekopieerd uit `deploy/Caddyfile` |
| `.env` | enkel op de server, `chmod 600`, nooit in de repo |

Docker-volumes: `talentenraad_data` (SQLite-bestand), `talentenraad_caddy_data` en `talentenraad_caddy_config` (certificaten).

## Variabelen in `.env`

Zie `.env.example` voor de volledige lijst met uitleg. Verplicht in productie (de app stopt anders met een melding):

- `AUTH_SECRET`: geheime sleutel voor sessiecookies, minstens 32 tekens.
- `SITE_URL`: publieke basis-URL (`https://talentenraad.be`), gebruikt in e-maillinks.
- `SMTP_HOST`: SMTP-server; verder `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- `ADMIN_EMAILS`: komma-gescheiden adressen die altijd admin zijn.
- `DATABASE_PATH`: in de container `/data/talentenraad.db`.

Optioneel: `ADMIN_NOTIFICATION_EMAIL`, `RECAPTCHA_SECRET_KEY` (runtime, in `.env`), `RECAPTCHA_PROJECT_ID`.

De reCAPTCHA site key (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`) wordt bij het bouwen in de code ingebakken. Zet hem als GitHub-repovariabele (geen secret) `RECAPTCHA_SITE_KEY`; leeg betekent reCAPTCHA uit.

## GitHub-secrets

- `DEPLOY_HOST`: hostnaam of IP van de server.
- `DEPLOY_SSH_KEY`: private sleutel van de gebruiker `deploy`.
- `DEPLOY_KNOWN_HOSTS`: uitvoer van `ssh-keyscan <host>` (de hostsleutel wordt strikt gecontroleerd).

Zijn ze niet ingesteld, dan bouwt de workflow alleen de image en slaat de deploy over met een melding.

## Hoe een deploy werkt

Triggers: push naar `main`, elke nacht om 02:00 UTC (voor verse basis-images; elke herstart voert de audit-log-opruiming uit, en de app herhaalt die elke 24 uur) en handmatig via `workflow_dispatch`.

1. Image bouwen en pushen naar `ghcr.io/tmttn/talentenraad` met tags `latest`, `sha-<7>` en `sha-<7>-<JJJJMMDD>` (datum in Brussel). De datum gaat mee als `BUILD_DATE` build-arg, zodat `next build` elke nacht opnieuw draait (pagina's met "komend/voorbij" worden bij het bouwen berekend) en de dated tag de container elke nacht opnieuw aanmaakt.
2. `compose.yaml` en `Caddyfile` naar de server kopiëren (scp).
3. Via SSH: `docker compose pull app`; pas als dat slaagt `docker compose up -d --remove-orphans`, daarna `docker image prune -f`. Mislukt de pull, dan stopt het script en blijft de vorige container draaien.
4. Health check op `https://talentenraad.be/api/health` (10 pogingen, 6 s ertussen). Mislukt die, dan is de job rood.

De deploy pint `TAG=sha-<7>-<JJJJMMDD>`, dus de draaiende versie is altijd herleidbaar.

## Handmatig uitrollen en terugrollen

```bash
ssh deploy@<host>
cd /opt/talentenraad

# nieuwste versie
docker compose pull app && docker compose up -d

# terugrollen naar een eerdere commit
TAG=sha-1234567 docker compose up -d   # of een dated tag, bv. sha-1234567-20261031
```

Let op: bij een volgende deploy wordt de tag opnieuw gezet; rol dus ook terug door de gewenste commit opnieuw te laten uitrollen als het blijvend moet zijn.

## Logs

```bash
docker compose logs -f app
docker compose logs -f caddy
docker compose ps
```

## Database en back-up

Het SQLite-bestand staat in het volume `talentenraad_data` als `/data/talentenraad.db` (WAL-modus). Een gewone `cp` tijdens het draaien kan een inconsistente kopie geven; gebruik de `.backup`-opdracht in een wegwerpcontainer, zonder de app te stoppen:

```bash
docker run --rm \
  -v talentenraad_data:/data \
  -v "$PWD":/backup \
  --entrypoint sqlite3 keinos/sqlite3 \
  /data/talentenraad.db ".backup '/backup/talentenraad-$(date +%F).db'"
```

Het volume is hier niet read-only gemount omdat SQLite in WAL-modus de `-shm`-file nodig heeft. De back-up staat daarna in de huidige map; kopieer die buiten de server (`scp`).

## Image in GHCR privé houden

Is het GHCR-pakket publiek, dan trekt de server de image anoniem. Blijft het privé, maak dan een Personal Access Token (classic) met enkel `read:packages` en log eenmalig in op de server:

```bash
echo <TOKEN> | docker login ghcr.io -u <github-gebruiker> --password-stdin
```

Docker bewaart de login voor de gebruiker `deploy`; de workflow hoeft niet te veranderen.
