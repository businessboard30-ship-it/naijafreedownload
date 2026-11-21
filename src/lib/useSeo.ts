import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ORIGIN, formatTitle, pageFor } from './routes';

export interface SeoOptions {
  /** Ask search engines not to index this view (errors, thin or empty pages). */
  noindex?: boolean;
  /** Open Graph type, defaults to website. */
  ogType?: string;
  /** Absolute https image URL for social previews. */
  image?: string;
  /** schema.org JSON-LD object describing this page. Only include facts that are visible on the page. */
  jsonLd?: Record<string, unknown>;
}

function setMeta(attr: 'name' | 'property', key: string, value: string | undefined) {
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (value === undefined) { el?.remove(); return; }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = value;
}

export function useSeo(title: string, description: string, options: SeoOptions = {}) {
  const { pathname } = useLocation();
  const { noindex, ogType = 'website', image, jsonLd } = options;
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    const fullTitle = formatTitle(title);
    const base = ((import.meta.env.VITE_SITE_URL as string | undefined) || ORIGIN).replace(/\/$/, '');
    const url = base + (pathname === '/' ? '/' : pathname.replace(/\/$/, ''));
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow');
    setMeta('property', 'og:type', ogType);
    setMeta('property', 'og:site_name', 'NaijaFreeDownload');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
    link.href = url;
    let script = document.head.querySelector<HTMLScriptElement>('script#page-jsonld');
    if (ld) {
      if (!script) { script = document.createElement('script'); script.id = 'page-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
      script.textContent = ld;
    } else script?.remove();
    return () => { document.head.querySelector('script#page-jsonld')?.remove(); };
  }, [title, description, pathname, noindex, ogType, image, ld]);
}

/** SEO for a top-level page whose title and description live in src/config/pages.json. */
export function usePageSeo(extra: SeoOptions = {}) {
  const { pathname } = useLocation();
  const page = pageFor(pathname);
  useSeo(page?.title ?? 'Page', page?.description ?? '', { noindex: page ? !page.index : true, ...extra });
}
