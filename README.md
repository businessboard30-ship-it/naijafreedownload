# NaijaFreeDownload

A worldwide discovery catalogue for music, movies, independent releases and documentaries. The platform welcomes content from every country, language and region. Only public-domain, creator-authorised or properly licensed content may be listed for download.

## Scope

NaijaFreeDownload is not limited to Nigeria or Africa. Its discovery experience should cover global cinema and music, including (but not limited to) Hollywood, Nollywood, Bollywood, European cinema, Korean and Japanese films, African cinema, Latin American productions, independent releases and international documentaries. Country and language filters should be global.

## Stack

Vite, React 18, TypeScript and React Router. The current catalogue frontend is static; API-backed features and runtime secrets must use a secure server-side integration.

## Project structure

```
public/            static files (favicon, _redirects, _headers, robots.txt)
public/data/       releases.json - the catalogue
src/config/        site settings and navigation
src/layouts/       app shell (top bar, fixed sidebar, content area)
src/components/    reusable UI (cards, pagination, states, sidebar, top bar)
src/pages/         route pages
src/lib/           catalogue logic, data loading, SEO helper, tests
src/styles/        base, layout and component CSS
```

## Develop

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

## Environment variables

Copy `.env.example` to `.env` for local use. Every `VITE_*` variable is bundled into public frontend code, so never put API tokens or secrets in them.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public site URL for canonical metadata |
| `VITE_CATALOGUE_URL` | Optional alternative catalogue URL (default `/data/releases.json`) |
| `VITE_CONTACT_EMAIL` | Optional public contact address for creators and takedowns |
| `VITE_ADS_ENABLED`, `VITE_ADSENSE_CLIENT`, `VITE_ADSENSE_SLOT_DETAIL` | AdSense (blank = no ads); see `docs/ADSENSE.md` |

## Content verification and review

Nothing is public unless it passes every rule in `src/lib/verification.ts`: title, category, creator, original source, official https URL, a rights basis (public domain, licensed, official artist/label, or verified authorised distributor), `sourceStatus: verified`, `reviewStatus: approved`, reviewer name and date. A download hosted on a different website than the official source also needs `authorisationEvidenceUrl`. Rows that fail are quarantined (ignored by the site and rejected by CI).

Review workflow (nothing is fetched or scraped; a human decides):

```bash
# 1. Put new submissions in catalogue/submissions.json (pending, with reviewStatus "pending")
npm run catalogue -- pending                       # what blocks each one
npm run catalogue -- approve <id> --by "Name" --source-checked --rights-checked
npm run catalogue -- reject <id> --reason "..."
npm run catalogue -- quarantine <id> --reason "..."
npm run catalogue -- takedown <id> --reason "..."  # removes from public data, logs in catalogue/takedowns.json
npm run catalogue:validate                         # fails if any public row is unverified
```

Releases use `public/data/releases.json`; movie download sources use `public/data/movie-downloads.json` (movie id = TMDB id; ids as `movie:<id>` in the CLI). Both are validated by `npm test` and during the build.

## AdSense

Ads are off by default. See `docs/ADSENSE.md`.

## Deployment

The production site is hosted on Cloudflare Pages. Follow the existing repository workflow and project settings when deploying. Keep API credentials in server-side Cloudflare secrets, never in frontend environment variables or committed files.

## Security notes

- Security headers are set in `public/_headers`.
- External links use `rel="noopener noreferrer"`.
- No secrets belong in this repository. `.env` files are git-ignored.
