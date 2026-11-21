import { describe, expect, it } from 'vitest';
import { movieSummary, musicSummary } from './editorial';

describe('editorial summaries', () => {
  it('uses only supplied facts', () => {
    const t = movieSummary({ title: 'Fixture', year: '2020', genres: ['Drama'] });
    expect(t).toBe('Fixture is a drama film released in 2020.');
    expect(t).not.toMatch(/directed|cast|minutes|acclaimed|award|rating/i);
  });
  it('adds director, cast and runtime when present', () => {
    const t = movieSummary({ title: 'F', director: 'D', cast: ['A', 'B'], runtime: 90 });
    expect(t).toContain('directed by D'); expect(t).toContain('A and B'); expect(t).toContain('90 minutes');
  });
  it('describes music without inventing background', () => {
    const t = musicSummary({ kind: 'song', name: 'S', artist: 'X', genre: 'Pop', releaseDate: '2021-03-04T08:00:00Z', album: 'Al', durationMs: 185000 });
    expect(t).toBe('S is a Pop song by X, released in 2021. It appears on the release Al. The track runs 3:05.');
    expect(musicSummary({ kind: 'artist', name: 'Z' })).toBe('Z is a recording artist.');
  });
});
