# NaijaFreeDownload

A catalogue for discovering and downloading **legally available** music, Nollywood films, independent releases and documentaries. Only public-domain, creator-authorised or properly licensed content may be listed.

## Stack

Vite, React 18, TypeScript and React Router. No backend and no runtime secrets: the site is static and deploys to Cloudflare Pages.

## Project structure

```
public/            static files (favicon, _redirects, _headers, robots.txt)
public/data/       releases.json - the catalogue (empty until content is approved)
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
npm run dev        # local dev server
npm run typecheck
npm test
npm run build      # outputs dist/
npm run preview    # serve the production build
```

## Environment variables

Copy `.env.example` to `.env` for local use. Every `VITE_*` variable is **bundled into public frontend code**, so never put API tokens or secrets in them.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public site URL for canonical metadata |
| `VITE_CATALOGUE_URL` | Optional alternative catalogue URL (default `/data/releases.json`) |
| `VITE_CONTACT_EMAIL` | Optional public contact address for creators and takedowns |

## Adding releases

Add objects to `public/data/releases.json` only after rights are verified.

```json
{
  "id": "unique-id",
  "title": "Title",
  "description": "Short description",
  "category": "music | movie | independent | documentary",
  "creator": "Artist or filmmaker",
  "releaseDate": "2025-03-14",
  "format": "MP3",
  "fileSizeMB": 8.4,
  "cover": "https://... or /covers/file.jpg",
  "licence": { "name": "CC BY 4.0", "url": "https://creativecommons.org/licenses/by/4.0/" },
  "source": { "name": "Creator website", "url": "https://..." },
  "downloadUrl": "https://..."
}
```

Entries without a licence name, an https licence link or an https download link are rejected at load time.

## Deploying to Cloudflare Pages (Git integration)

The existing `naijafreedownload.pages.dev` project was created with Direct Upload and cannot be converted. Create a **new** Pages project instead and leave the old one running:

1. Cloudflare dashboard: Workers & Pages, Create, Pages, Connect to Git.
2. Select `businessboard30-ship-it/naijafreedownload`.
3. Production branch: `main`. Build command: `npm run build`. Output directory: `dist`. Node version: 20 or later.
4. Add `VITE_SITE_URL` if desired, then deploy. Pushes to `main` deploy to production and other branches get previews.
5. Test the preview and production URLs before planning any move of the production address. Do not change DNS or delete the old project until that is approved.

## Security notes

- Security headers are set in `public/_headers`.
- External links use `rel="noopener noreferrer"`.
- No secrets belong in this repository. `.env` files are git-ignored.
