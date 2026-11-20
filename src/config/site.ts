export const SITE_NAME = 'NaijaFreeDownload';
export const REPO_URL = 'https://github.com/businessboard30-ship-it/naijafreedownload';
export const ISSUES_URL = `${REPO_URL}/issues`;
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL ?? '';
export const CATALOGUE_URL: string = import.meta.env.VITE_CATALOGUE_URL || '/data/releases.json';

export interface NavItem { to: string; label: string; end?: boolean }
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Browse', items: [
    { to: '/', label: 'Overview', end: true },
    { to: '/music', label: 'Music' },
    { to: '/movies', label: 'Movies' },
    { to: '/independent', label: 'Independent creators' },
    { to: '/documentaries', label: 'Documentaries' },
    { to: '/latest', label: 'Latest releases' },
    { to: '/search', label: 'Search' },
  ] },
  { group: 'Resources', items: [
    { to: '/creators', label: 'For creators' },
    { to: '/about', label: 'About' },
    { to: '/copyright', label: 'Copyright and takedown' },
  ] },
];
