# Talentenraad website

![Static Badge](https://img.shields.io/badge/Next.js-000?style=flat&logo=next.js)
![Static Badge](https://img.shields.io/badge/Formspree-c10c21?style=flat&logo=formspree)
![Static Badge](https://img.shields.io/badge/tailwindcss-0F172A?style=flat&logo=tailwindcss)


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) for the Talentenraad parent council of the Talentenhuis school in Beverst (Belgium).

## Ontwikkelen

Kopieer `.env.example` naar `.env.local` en vul de waarden in. Daarna:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). De SQLite-database staat lokaal in `./data/` en wordt bij het opstarten automatisch gemigreerd.

## Uitrollen

De site draait als Docker-container achter Caddy op een Hetzner-server en wordt via GitHub Actions uitgerold. Zie [deploy/README.md](deploy/README.md).
