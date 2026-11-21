import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { PAGES, STATIC_PATHS, formatTitle, isKnownRoute } from './routes';
import { planFor } from './prerender';
import { NAV } from '../config/site';

describe('seo config', () => {
  it('has unique titles and descriptions of a sensible length', () => {
    const titles = PAGES.map((p) => formatTitle(p.title));
    const descs = PAGES.map((p) => p.description);
    expect(new Set(titles).size).toBe(PAGES.length);
    expect(new Set(descs).size).toBe(PAGES.length);
    for (const d of descs) { expect(d.length).toBeGreaterThan(50); expect(d.length).toBeLessThanOrEqual(170); }
  });
  it('covers every required page', () => {
    for (const p of ['/about', '/contact', '/privacy', '/terms', '/copyright', '/music', '/movies']) {
      expect(STATIC_PATHS).toContain(p);
      expect(PAGES.find((x) => x.path === p)?.index).toBe(true);
    }
  });
  it('every route in the app router is known to the server', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    const paths = [...app.matchAll(/path="([^"*]+)"/g)].map((m) => m[1]);
    for (const path of paths) {
      const concrete = '/' + path.replace(/:[a-zA-Z]+/g, '123');
      expect(isKnownRoute(concrete), concrete).toBe(true);
    }
    for (const item of NAV.flatMap((g) => g.items)) expect(isKnownRoute(item.to), item.to).toBe(true);
  });
  it('answers unknown URLs with 404 and noindex, known URLs with 200', () => {
    for (const bad of ['/nope', '/movies/abc', '/music/song/x', '/privacy/extra', '/admin']) {
      const plan = planFor(bad);
      expect(plan.status, bad).toBe(404);
      expect(plan.robots).toContain('noindex');
    }
    expect(planFor('/privacy').status).toBe(200);
    expect(planFor('/movies/550').status).toBe(200);
    expect(planFor('/privacy').canonical).toBe('https://naijafreedownload.pages.dev/privacy');
  });
  it('gives crawlable internal links in the server-rendered fallback', () => {
    const html = planFor('/about').bodyHtml;
    for (const p of ['/music', '/movies', '/privacy', '/terms', '/copyright', '/contact', '/about']) expect(html).toContain(`href="${p}"`);
  });
  it('sitemap lists only indexable pages and robots points to it', () => {
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    for (const p of PAGES) {
      const loc = `<loc>https://naijafreedownload.pages.dev${p.path === '/' ? '/' : p.path}</loc>`;
      expect(sitemap.includes(loc), p.path).toBe(p.index);
    }
    expect(readFileSync('public/robots.txt', 'utf8')).toContain('Sitemap: https://naijafreedownload.pages.dev/sitemap.xml');
  });
});
