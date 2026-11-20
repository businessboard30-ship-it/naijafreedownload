import { useEffect } from 'react';
import { SITE_NAME } from '../config/site';

export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title === 'Overview' ? SITE_NAME : `${title} | ${SITE_NAME}`;
    const set = (sel: string, attr: string, key: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = value;
    };
    set('meta[name="description"]', 'name', 'description', description);
    set('meta[property="og:title"]', 'property', 'og:title', document.title);
    set('meta[property="og:description"]', 'property', 'og:description', description);
    const base = ((import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin).replace(/\/$/, '');
    if (base) {
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
      link.href = base + window.location.pathname;
    }
  }, [title, description]);
}
