import type { Category, Release } from '../types';
import { classify, isHttpsUrl, verificationProblems } from './verification';

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

const str = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

/** Every reason a catalogue row cannot be published. Empty means verified and approved. */
export function releaseProblems(r: unknown): string[] {
  if (!r || typeof r !== 'object') return ['not an object'];
  const x = r as Record<string, any>;
  const p: string[] = [];
  if (!str(x.id)) p.push('id is required');
  if (!str(x.title)) p.push('title is required');
  if (!str(x.creator)) p.push('artist, creator or distributor (creator) is required');
  if (!str(x.format)) p.push('format is required');
  if (!str(x.description)) p.push('description is required');
  if (typeof x.category !== 'string' || !(x.category in CATEGORY_LABELS)) p.push('category must be one of: ' + Object.keys(CATEGORY_LABELS).join(', '));
  if (Number.isNaN(Date.parse(x.releaseDate))) p.push('releaseDate must be a valid date');
  if (typeof x.fileSizeMB !== 'number' || x.fileSizeMB < 0) p.push('fileSizeMB must be a non-negative number');
  if (!x.licence || !str(x.licence.name) || !isHttpsUrl(x.licence.url)) p.push('licence needs a name and an https URL');
  if (!x.source || !str(x.source.name)) p.push('original content source name is required');
  if (x.source && x.source.url !== undefined && !isHttpsUrl(x.source.url)) p.push('source.url must be https when given');
  if (!(x.cover === undefined || isHttpsUrl(x.cover) || (typeof x.cover === 'string' && x.cover.startsWith('/')))) p.push('cover must be https or a site path');
  p.push(...verificationProblems(x.verification, [x.downloadUrl]));
  return p;
}

/** A release is only published if it passes every verification rule. */
export function isPublishable(r: unknown): r is Release {
  return releaseProblems(r).length === 0;
}
export function sanitise(raw: unknown): Release[] {
  return classify<Release>(raw, releaseProblems).approved;
}
/** Rows kept out of public listings, with the reasons (used by the review CLI and tests). */
export function quarantine(raw: unknown) {
  return classify<Release>(raw, releaseProblems).quarantined;
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
