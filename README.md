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

## Adding releases

Add objects to `public/data/releases.json` only after rights are verified. Every entry must include the licence name, HTTPS licence URL and HTTPS authorised download URL. Never fabricate download availability or file sizes.

## Deployment

The production site is hosted on Cloudflare Pages. Follow the existing repository workflow and project settings when deploying. Keep API credentials in server-side Cloudflare secrets, never in frontend environment variables or committed files.

## Security notes

- Security headers are set in `public/_headers`.
- External links use `rel="noopener noreferrer"`.
- No secrets belong in this repository. `.env` files are git-ignored.
