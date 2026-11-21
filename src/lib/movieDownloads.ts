import { classify, isHttpsUrl, verificationProblems, type Verification } from './verification';

export interface MovieDownloadSource { label: string; url: string }
export interface MovieDownloadEntry {
  movieId: number;
  title: string;
  year?: string;
  /** Plain-language statement of why this file may be distributed. */
  rightsNote: string;
  sources: MovieDownloadSource[];
  verification: Verification;
}

/** Every reason a movie-download row cannot be published. Empty means verified and approved. */
export function movieDownloadProblems(raw: unknown): string[] {
  if (!raw || typeof raw !== 'object') return ['not an object'];
  const e = raw as Record<string, any>;
  const p: string[] = [];
  if (!Number.isInteger(e.movieId)) p.push('movieId (TMDB id) must be an integer');
  if (typeof e.title !== 'string' || !e.title.trim()) p.push('title is required');
  if (typeof e.rightsNote !== 'string' || !e.rightsNote.trim()) p.push('rightsNote is required');
  const sources: any[] = Array.isArray(e.sources) ? e.sources : [];
  if (sources.length === 0) p.push('at least one source is required');
  for (const s of sources) {
    if (!s || typeof s.label !== 'string' || !s.label.trim() || !isHttpsUrl(s.url)) p.push('each source needs a label and an https url');
  }
  p.push(...verificationProblems(e.verification, sources.map((s) => s?.url)));
  return p;
}

export const sanitiseMovieDownloads = (rows: unknown) => classify<MovieDownloadEntry>(rows, movieDownloadProblems).approved;

let cache: Promise<MovieDownloadEntry[]> | undefined;
export function loadMovieDownloads(): Promise<MovieDownloadEntry[]> {
  if (!cache) {
    cache = fetch('/data/movie-downloads.json', { headers: { Accept: 'application/json' } })
      .then((response) => { if (!response.ok) throw new Error('Download catalogue unavailable.'); return response.json(); })
      .then((data: { movies?: unknown }) => sanitiseMovieDownloads(data?.movies))
      .catch((error) => { cache = undefined; throw error; });
  }
  return cache;
}
