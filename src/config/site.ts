export const SITE_NAME = 'NaijaFreeDownload';
export const REPO_URL = 'https://github.com/businessboard30-ship-it/naijafreedownload';
export const ISSUES_URL = `${REPO_URL}/issues`;
export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || 'businessboard30@gmail.com';
export const CATALOGUE_URL: string = import.meta.env.VITE_CATALOGUE_URL || '/data/releases.json';

export { NAV } from './nav';
export type { NavItem } from './nav';
