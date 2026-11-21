/** Navigation. Pure data (no Vite env access) so server functions can import it. */
export interface NavItem { to: string; label: string; end?: boolean }
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Browse', items: [
    { to: '/', label: 'Overview', end: true },
    { to: '/music', label: 'Music' },
    { to: '/movies', label: 'Movies' },
    { to: '/nigeria-movies', label: 'Nigeria movies' },
    { to: '/seasonal', label: 'Seasonal movies' },
    { to: '/downloads', label: 'Downloads' },
    { to: '/anime', label: 'Anime' },
    { to: '/independent', label: 'Independent creators' },
    { to: '/documentaries', label: 'Documentaries' },
    { to: '/latest', label: 'Latest releases' },
    { to: '/search', label: 'Search' },
  ] },
  { group: 'Resources', items: [
    { to: '/creators', label: 'For creators' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact us' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms and Conditions' },
    { to: '/copyright', label: 'Copyright and takedown' },
  ] },
];
