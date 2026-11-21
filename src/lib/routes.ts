/**
 * Every URL the app can render. Used by the Cloudflare middleware to answer unknown
 * addresses with a real HTTP 404 (instead of the single-page app's default 200).
 * Keep in sync with src/App.tsx (a test checks this).
 */
import pages from '../config/pages.json';

export const STATIC_PATHS: string[] = pages.pages.map((p) => p.path);

const DYNAMIC: RegExp[] = [
  /^\/movies\/\d+$/,
  /^\/tv\/\d+$/,
  /^\/movie-character\/\d+\/\d+$/,
  /^\/anime\/\d+$/,
  /^\/anime-character\/\d+$/,
  /^\/people\/\d+$/,
  /^\/music\/(song|album|artist)\/\d+$/,
];

export function isKnownRoute(pathname: string): boolean {
  return STATIC_PATHS.includes(pathname) || DYNAMIC.some((re) => re.test(pathname));
}

export interface PageMeta { path: string; title: string; description: string; index: boolean; heading: string }
export const PAGES: PageMeta[] = pages.pages as PageMeta[];
export const ORIGIN: string = pages.origin;
export const SITE: string = pages.siteName;
export const pageFor = (pathname: string): PageMeta | undefined => PAGES.find((p) => p.path === pathname);
export const formatTitle = (title: string): string => (title === SITE || title.endsWith(`| ${SITE}`) ? title : `${title} | ${SITE}`);
