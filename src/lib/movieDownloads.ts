export interface MovieDownloadSource { label: string; url: string }
export interface MovieDownloadEntry {
  movieId: number;
  title: string;
  year?: string;
  rightsVerified: boolean;
  rightsNote: string;
  sources: MovieDownloadSource[];
}
let cache: Promise<MovieDownloadEntry[]> | undefined;
function validUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
export function loadMovieDownloads(): Promise<MovieDownloadEntry[]> {
  if (!cache) {
    cache = fetch('/data/movie-downloads.json', { headers: { Accept: 'application/json' } })
      .then((response) => { if (!response.ok) throw new Error('Download catalogue unavailable.'); return response.json(); })
      .then((data: { movies?: unknown[] }) => (Array.isArray(data.movies) ? data.movies : [])
        .filter((item): item is MovieDownloadEntry => {
          if (!item || typeof item !== 'object') return false;
          const entry = item as Record<string, unknown>;
          return Number.isInteger(entry.movieId) && typeof entry.title === 'string'
            && entry.rightsVerified === true && typeof entry.rightsNote === 'string'
            && Array.isArray(entry.sources) && entry.sources.some((source) =>
              !!source && typeof source === 'object' && typeof (source as Record<string, unknown>).label === 'string'
              && validUrl((source as Record<string, unknown>).url));
        })
        .map((entry) => ({ ...entry, sources: entry.sources.filter((source) =>
          !!source && typeof source.label === 'string' && validUrl(source.url)) } as MovieDownloadEntry)))
      .catch((error) => { cache = undefined; throw error; });
  }
  return cache;
}
