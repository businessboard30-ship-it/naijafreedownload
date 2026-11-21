/**
 * Describes what the server should send for a URL before any JavaScript runs: the HTTP status,
 * head metadata and crawlable fallback content. Pure so it can be unit tested; applied by
 * functions/_middleware.ts.
 */
import { NAV } from '../config/nav';
import { ORIGIN, SITE, formatTitle, isKnownRoute, pageFor } from './routes';

export interface ShellPlan {
  status: 200 | 404;
  title: string;
  description: string;
  robots: string;
  canonical: string;
  bodyHtml: string;
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const DYNAMIC_TITLES: [RegExp, string, string][] = [
  [/^\/movies\/\d+$/, 'Movie details', 'Synopsis, cast, release information and verified download availability for this film.'],
  [/^\/tv\/\d+$/, 'TV series details', 'Synopsis, cast, seasons and release information for this series.'],
  [/^\/movie-character\/\d+\/\d+$/, 'Movie character profile', 'A character, the performer and other screen credits.'],
  [/^\/anime\/\d+$/, 'Anime details', 'Synopsis, studios, season and release information for this anime.'],
  [/^\/anime-character\/\d+$/, 'Anime character profile', 'Character profile and anime appearances.'],
  [/^\/people\/\d+$/, 'Actor and filmmaker profile', 'Biography and filmography.'],
  [/^\/music\/(song|album|artist)\/\d+$/, 'Music details', 'Artist, genre, release information and official listening pages.'],
];

function links(): string {
  const items = NAV.flatMap((g) => g.items).map((i) => `<li><a href="${escapeHtml(i.to)}">${escapeHtml(i.label)}</a></li>`).join('');
  return `<nav aria-label="Main"><ul>${items}</ul></nav>`;
}

export function planFor(pathname: string, origin: string = ORIGIN): ShellPlan {
  const canonical = origin.replace(/\/$/, '') + (pathname === '/' ? '/' : pathname);
  if (!isKnownRoute(pathname)) {
    return {
      status: 404, title: formatTitle('Page not found'), robots: 'noindex,follow', canonical: origin + '/',
      description: 'The page you requested does not exist on NaijaFreeDownload.',
      bodyHtml: `<main><h1>Page not found</h1><p>This address does not match any page on ${SITE}.</p><p><a href="/">Go to the home page</a></p>${links()}</main>`,
    };
  }
  const page = pageFor(pathname);
  if (page) {
    return {
      status: 200, title: formatTitle(page.title), description: page.description, robots: page.index ? 'index,follow' : 'noindex,follow', canonical,
      bodyHtml: `<main><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.description)}</p>${links()}<noscript><p>${SITE} needs JavaScript to browse the live catalogue.</p></noscript></main>`,
    };
  }
  const dyn = DYNAMIC_TITLES.find(([re]) => re.test(pathname));
  return {
    status: 200, title: formatTitle(dyn?.[1] ?? 'Details'), description: dyn?.[2] ?? '', robots: 'index,follow', canonical,
    bodyHtml: `<main><h1>${escapeHtml(dyn?.[1] ?? SITE)}</h1><p>${escapeHtml(dyn?.[2] ?? '')}</p>${links()}</main>`,
  };
}
