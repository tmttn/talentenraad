# Uitrol naar Hetzner

De site draait als Docker-container op een kleine VPS, met Caddy ervoor voor HTTPS. GitHub Actions bouwt en rolt uit (`.github/workflows/deploy.yml`).

Server: Hetzner Cloud `cax11` (ARM, 2 vCPU, 4 GB RAM) in Falkenstein (`fsn1`), Ubuntu 24.04, aangemaakt met `deploy/cloud-init.yaml`. Het image wordt daarom voor `linux/arm64` gebouwd, op een ARM-runner van GitHub. Wie naar een x86-server verhuist, zet in de workflow `runs-on` terug op `ubuntu-latest` en `platforms` op `linux/amd64`.

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

Optioneel: `GITHUB_CONTENT_TOKEN` (content-editor, zie hieronder), `ADMIN_NOTIFICATION_EMAIL`, `RECAPTCHA_SECRET_KEY` (runtime, in `.env`), `RECAPTCHA_PROJECT_ID`.

De reCAPTCHA site key (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`) wordt bij het bouwen in de code ingebakken. Zet hem als GitHub-repovariabele (geen secret) `RECAPTCHA_SITE_KEY`; leeg betekent reCAPTCHA uit.

## Token voor de content-editor

De editor in de admin (`/admin/content`) schrijft elke wijziging als één commit op `main` via de GitHub API; die push start de gewone deploy. Daarvoor staat in `.env` een fine-grained personal access token:

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Resource owner: `tmttn`; Repository access: *Only select repositories* → `tmttn/talentenraad`.
3. Permissions: **Contents: Read and write** en **Actions: Read** (voor de status "Online" na opslaan). Verder niets.
4. Vervaldatum: maximaal een jaar; zet een herinnering om hem te vernieuwen. Een verlopen token geeft in de editor een foutmelding bij opslaan, de site zelf blijft werken.
5. Zet hem zelf op de server (nooit in chat, issues of commits plakken):
   ```bash
   ssh -t deploy@<host> "TERM=xterm-256color nano /opt/talentenraad/.env"
   # GITHUB_CONTENT_TOKEN=github_pat_...
   cd /opt/talentenraad && docker compose up -d app
   ```

De token moet de bescherming van `main` (verplichte review en checks) kunnen omzeilen: dat lukt omdat de eigenaar van de token admin van de repo is en admins in de bypass-lijst staan. Commits van de editor staan op naam van `Talentenraad-editor <noreply@talentenraad.be>`, zonder naam of e-mail van de ouder (de repo is publiek); de audit log in de admin koppelt elke commit aan wie hem maakte. `GITHUB_REPO` en `GITHUB_BRANCH` zijn optioneel (standaard `tmttn/talentenraad` en `main`).

Intrekken: verwijder de token op GitHub; de editor meldt dan "nog niet ingesteld" zodra de variabele leeg is, of een fout bij opslaan zolang hij nog in `.env` staat.

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

Het SQLite-bestand staat in het volume `talentenraad_data` als `/data/talentenraad.db` (WAL-modus). Een gewone `cp` tijdens het draaien kan een inconsistente kopie geven. Gebruik de back-up-API van `better-sqlite3` in de draaiende app-container (dezelfde image, WAL-veilig, de app hoeft niet te stoppen):

```bash
cd /opt/talentenraad
f=backup-$(date +%F).db
docker compose exec -T app node -e "require('better-sqlite3')('/data/talentenraad.db').backup('/data/$f').then(()=>console.log('ok'))"
docker compose cp "app:/data/$f" .
docker compose exec -T app rm "/data/$f"
```

Kopieer het bestand daarna buiten de server (`scp`). Een alternatief is de optie Back-ups bij Hetzner (+20% van de serverprijs, dagelijkse snapshots van de hele server) die Tom in de Cloud Console kan aanzetten.

## IPv6 en client-IP's

`compose.yaml` maakt het standaardnetwerk dual-stack (`enable_ipv6` met subnet `fd00:7a1e::/64`; het IPv4-subnet kiest Docker zelf). Zonder IPv6 op het netwerk stuurt Docker IPv6-bezoekers via de userland-proxy naar Caddy met het bridge-adres als bron, waardoor alle IPv6-bezoekers één rate-limit-emmer delen en het audit log een fout adres toont.

Sinds Docker 27 hoeft de daemon-optie `ipv6` niet meer aan; wel moet `ip6tables` aan staan zodat poorten via NAT (met behoud van het bronadres) worden gepubliceerd. Docker 28+ doet dat standaard; `deploy/cloud-init.yaml` zet het toch expliciet in `/etc/docker/daemon.json`. Op een bestaande server: maak dat bestand aan met `{"ip6tables": true}`, `sudo systemctl restart docker` en daarna `docker compose up -d` (het netwerk wordt opnieuw aangemaakt).

Controleren: bezoek de site via IPv6 (`curl -6 https://talentenraad.be/api/health`, vanaf een host met IPv6; de server heeft een IPv6-adres van Hetzner nodig en een AAAA-record), laat de login of het contactformulier één keer lopen en kijk in de admin of het audit log een echt IPv6-adres toont in plaats van `172.x.x.1` of `fd00:7a1e::1`.

## Image in GHCR privé houden

Is het GHCR-pakket publiek, dan trekt de server de image anoniem. Blijft het privé, maak dan een Personal Access Token (classic) met enkel `read:packages` en log eenmalig in op de server:

```bash
echo <TOKEN> | docker login ghcr.io -u <github-gebruiker> --password-stdin
```

Docker bewaart de login voor de gebruiker `deploy`; de workflow hoeft niet te veranderen.
