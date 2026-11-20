import { describe, expect, it } from 'vitest';
import { queryReleases, sanitise, facets } from './catalogue';
import type { Release } from '../types';

// Test fixtures only. Never shipped as catalogue data.
const mk = (i: number, over: Partial<Release> = {}): Release => ({
  id: `t${i}`, title: `Title ${String.fromCharCode(65 + (i % 26))}${i}`, description: 'Fixture description',
  category: i % 2 ? 'music' : 'movie', creator: `Creator ${i}`, releaseDate: `2025-01-${String((i % 28) + 1).padStart(2, '0')}`,
  format: i % 2 ? 'MP3' : 'MP4', fileSizeMB: i * 10,
  licence: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  source: { name: 'Fixture' }, downloadUrl: 'https://example.com/file', ...over,
});
const items = Array.from({ length: 30 }, (_, i) => mk(i + 1));
const base = { q: '', format: '', licence: '', sort: 'newest' as const, page: 1 };

describe('catalogue', () => {
  it('rejects unlicensed or non-https releases', () => {
    const bad = [mk(1, { downloadUrl: 'http://x.com/a' }), mk(2, { licence: { name: '', url: 'https://a.b' } }), { nope: true }];
    expect(sanitise([...bad, mk(3)])).toHaveLength(1);
    expect(sanitise('not an array')).toEqual([]);
  });
  it('paginates and clamps page', () => {
    const r = queryReleases(items, { ...base, page: 99 });
    expect(r.pageCount).toBe(3);
    expect(r.page).toBe(3);
    expect(r.items).toHaveLength(6);
  });
  it('filters by category, format and text', () => {
    expect(queryReleases(items, { ...base, category: 'music' }).total).toBe(15);
    expect(queryReleases(items, { ...base, format: 'MP4' }).total).toBe(15);
    expect(queryReleases(items, { ...base, q: 'creator 7' }).total).toBe(1);
  });
  it('sorts', () => {
    expect(queryReleases(items, { ...base, sort: 'size' }).items[0].fileSizeMB).toBe(10);
    const t = queryReleases(items, { ...base, sort: 'title' }).items;
    expect(t[0].title <= t[1].title).toBe(true);
  });
  it('builds facets', () => {
    expect(facets(items).formats).toEqual(['MP3', 'MP4']);
  });
});
