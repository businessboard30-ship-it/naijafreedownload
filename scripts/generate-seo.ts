/**
 * Generates public/sitemap.xml and public/robots.txt from src/config/pages.json, and public/ads.txt
 * only when a valid VITE_ADSENSE_CLIENT is set (never invented). Runs automatically before `npm run build`.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { adsTxtFor } from '../src/lib/ads';

const cfg = JSON.parse(readFileSync('src/config/pages.json', 'utf8')) as { origin: string; pages: { path: string; index: boolean }[] };
const origin = (process.env.VITE_SITE_URL || cfg.origin).replace(/\/$/, '');

const urls = cfg.pages.filter((p) => p.index).map((p) => `  <url><loc>${origin}${p.path === '/' ? '/' : p.path}</loc></url>`);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);

const ads = adsTxtFor(process.env.VITE_ADSENSE_CLIENT);
if (ads) { writeFileSync('public/ads.txt', ads); console.log('ads.txt written for the configured publisher.'); }
else if (existsSync('public/ads.txt')) rmSync('public/ads.txt');
console.log(`sitemap.xml: ${urls.length} URLs; robots.txt written.`);
