import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { quarantine } from './catalogue';
import { movieDownloadProblems } from './movieDownloads';

describe('shipped catalogue data', () => {
  it('contains only verified, approved releases', () => {
    const releases = JSON.parse(readFileSync('public/data/releases.json', 'utf8'));
    expect(quarantine(releases)).toEqual([]);
  });
  it('contains only verified, approved movie downloads', () => {
    const { movies } = JSON.parse(readFileSync('public/data/movie-downloads.json', 'utf8'));
    for (const m of movies) expect(movieDownloadProblems(m), `movie ${m.movieId}`).toEqual([]);
  });
  it('keeps pending submissions out of the public folder', () => {
    const subs = JSON.parse(readFileSync('catalogue/submissions.json', 'utf8'));
    expect(Array.isArray(subs.releases) && Array.isArray(subs.movieDownloads)).toBe(true);
  });
});
