# AdSense integration

**Status: integrated but switched off.** No ad code loads and no ad space is rendered until you set the variables below. Approval is Google's decision; this repository only makes the site ready for review.

## Turning it on (only after Google approves the site)
1. In Cloudflare Pages (and the GitHub repository variables used by `.github/workflows/deploy.yml`), set:
   - `VITE_ADSENSE_CLIENT` = your publisher ID (`ca-pub-…`)
   - `VITE_ADSENSE_SLOT_DETAIL` = the ad unit ID created in AdSense
   - `VITE_ADS_ENABLED` = `true`
2. Redeploy. The build generates `public/ads.txt` from the publisher ID (`npm run seo`), so `/ads.txt` is served at the site root. With no ID there is no `ads.txt`.
3. Verify in AdSense that the site is connected and `ads.txt` is found.

## Rules built into the code (`src/lib/ads.ts`, `src/components/AdSlot.tsx`)
- Ads appear only if config is valid, the visitor clicked "Accept ads cookies", and the page is a content page (movie, TV, music, anime or person detail).
- Never on home, search, download, policy, contact, creator or error pages.
- Never inside the download dialog or next to download or navigation buttons; the ad block sits after the page content, with its own border and the label "Advertisement".
- No wording anywhere asks visitors to click ads.
- The `adsbygoogle.js` script is loaded only after consent, from one place (`loadAdSenseScript`).

## Review checklist before applying
- Add real verified entries to the catalogue (`npm run catalogue -- pending`), so key sections have substantial original content.
- Confirm the contact email works and the Privacy Policy matches what you actually enable.
