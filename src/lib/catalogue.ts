import type { Category, Release } from '../types';

export const CATEGORY_LABELS: Record<Category, string> = {
  music: 'Music',
  movie: 'Movies & Nollywood',
  independent: 'Independent creators',
  documentary: 'Documentaries',
  adult: '18+ / Adult',
};
export type SortKey = 'newest' | 'oldest' | 'title' | 'size';
export const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest first', oldest: 'Oldest first', title: 'Title A to Z', size: 'Smallest file',
};
export const PAGE_SIZE = 12;

export interface Query {
  q: string; category?: Category | ''; format: string; licence: string;
  sort: SortKey; page: number; pageSize?: number;
}
export interface Result { items: Release[]; total: number; page: number; pageCount: number }

function isHttps(u: unknown): boolean {
  if (typeof u !== 'string') return false;
  try { return new URL(u).protocol === 'https:'; } catch { return false; }
}
const str = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** A release is only published if it has a licence and https download link. */
export function isPublishable(r: unknown): r is Release {
  if (!r || typeof r !== 'object') return false;
  const x = r as Record<string, any>;
  return str(x.id) && str(x.title) && str(x.creator) && str(x.format) && str(x.description)
    && x.category in CATEGORY_LABELS
    && !Number.isNaN(Date.parse(x.releaseDate))
    && typeof x.fileSizeMB === 'number' && x.fileSizeMB >= 0
    && !!x.licence && str(x.licence.name) && isHttps(x.licence.url)
    && !!x.source && str(x.source.name)
    && isHttps(x.downloadUrl)
    && (x.cover === undefined || isHttps(x.cover) || (typeof x.cover === 'string' && x.cover.startsWith('/')));
}
export function sanitise(raw: unknown): Release[] {
  return Array.isArray(raw) ? raw.filter(isPublishable) : [];
}

export function facets(items: Release[]) {
  const uniq = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b));
  return { formats: uniq(items.map((i) => i.format)), licences: uniq(items.map((i) => i.licence.name)) };
}

export function queryReleases(items: Release[], q: Query): Result {
  const needle = q.q.trim().toLowerCase();
  let out = items.filter((r) =>
    (q.category ? r.category === q.category : r.category !== 'adult') &&
    (!q.format || r.format === q.format) &&
    (!q.licence || r.licence.name === q.licence) &&
    (!needle || [r.title, r.creator, r.description].some((s) => s.toLowerCase().includes(needle))));
  const by: Record<SortKey, (a: Release, b: Release) => number> = {
    newest: (a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate),
    oldest: (a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate),
    title: (a, b) => a.title.localeCompare(b.title),
    size: (a, b) => a.fileSizeMB - b.fileSizeMB,
  };
  out = [...out].sort(by[q.sort]);
  const size = q.pageSize ?? PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(out.length / size));
  const page = Math.min(Math.max(1, q.page), pageCount);
  return { items: out.slice((page - 1) * size, page * size), total: out.length, page, pageCount };
}

export function formatSize(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}
