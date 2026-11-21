import { describe, expect, it } from 'vitest';
import { releaseProblems, quarantine, sanitise } from './catalogue';
import { movieDownloadProblems, sanitiseMovieDownloads } from './movieDownloads';
import { verificationProblems } from './verification';

// Test fixtures only. Never shipped as catalogue data.
const ver = (over: Record<string, unknown> = {}) => ({
  rightsBasis: 'public-domain', officialUrl: 'https://archive.example/item', sourceStatus: 'verified',
  reviewStatus: 'approved', reviewedBy: 'Reviewer', reviewedAt: '2026-02-03', ...over,
});
const release = (over: Record<string, unknown> = {}) => ({
  id: 'r1', title: 'Song', description: 'Fixture', category: 'music', creator: 'Artist',
  releaseDate: '2024-05-01', format: 'MP3', fileSizeMB: 4,
  licence: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  source: { name: 'Archive' }, downloadUrl: 'https://archive.example/file.mp3', verification: ver(), ...over,
});

describe('verification rules', () => {
  it('accepts a fully verified item', () => {
    expect(verificationProblems(ver(), ['https://archive.example/file'])).toEqual([]);
    expect(releaseProblems(release())).toEqual([]);
  });
  it('quarantines items with no verification block', () => {
    const { verification: _v, ...bare } = release();
    expect(sanitise([bare])).toHaveLength(0);
    expect(quarantine([bare])[0].problems).toContain('verification block is missing');
  });
  it('requires verified source and approved review', () => {
    for (const bad of [{ sourceStatus: 'unverified' }, { sourceStatus: 'rejected' }, { reviewStatus: 'pending' },
      { reviewStatus: 'quarantined' }, { reviewStatus: 'rejected' }, { reviewStatus: 'taken-down' }]) {
      expect(sanitise([release({ verification: ver(bad) })])).toHaveLength(0);
    }
  });
  it('requires rights basis, official https URL, reviewer and date', () => {
    for (const bad of [{ rightsBasis: 'found-online' }, { officialUrl: 'http://x.example' }, { officialUrl: '' },
      { reviewedBy: ' ' }, { reviewedAt: 'yesterday' }]) {
      expect(sanitise([release({ verification: ver(bad) })])).toHaveLength(0);
    }
  });
  it('never assumes a third-party download host is authorised', () => {
    const other = release({ downloadUrl: 'https://filehost.example/abc' });
    expect(sanitise([other])).toHaveLength(0);
    const withEvidence = release({ downloadUrl: 'https://filehost.example/abc', verification: ver({ authorisationEvidenceUrl: 'https://label.example/statement' }) });
    expect(sanitise([withEvidence])).toHaveLength(1);
    expect(sanitise([release({ downloadUrl: 'https://www.archive.example/other' })])).toHaveLength(1);
  });
  it('requires title, creator, source and licence', () => {
    expect(sanitise([release({ title: '' }), release({ creator: '' }), release({ source: { name: '' } }),
      release({ licence: { name: 'x', url: 'http://insecure.example' } })])).toHaveLength(0);
  });
  it('applies the same rules to movie downloads', () => {
    const movie = (over: Record<string, unknown> = {}) => ({
      movieId: 10, title: 'Film', rightsNote: 'Public domain.', sources: [{ label: 'Archive', url: 'https://archive.example/film' }],
      verification: ver(), ...over,
    });
    expect(movieDownloadProblems(movie())).toEqual([]);
    expect(sanitiseMovieDownloads([movie(), movie({ verification: ver({ reviewStatus: 'pending' }) }),
      movie({ sources: [{ label: 'Host', url: 'https://filehost.example/x' }] }), { movieId: 1, rightsVerified: true }])).toHaveLength(1);
  });
});
