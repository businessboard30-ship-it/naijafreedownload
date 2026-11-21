/**
 * Plain-language summaries assembled ONLY from fields the catalogue sources actually returned.
 * Missing facts are left out, never guessed. No ratings or reviews are produced here.
 */
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);

export interface MovieFacts { title: string; year?: string; genres?: string[]; language?: string; countries?: string[]; runtime?: number; director?: string; cast?: string[]; status?: string }

export function movieSummary(f: MovieFacts): string {
  const parts: string[] = [];
  const kind = f.genres?.length ? `${list(f.genres.map((g) => g.toLowerCase()))} film` : 'film';
  let first = `${f.title} is a ${kind}`;
  if (f.year) first += ` released in ${f.year}`;
  if (f.countries?.length) first += `, with ${f.countries.length > 1 ? 'origins in' : 'origin in'} ${list(f.countries)}`;
  parts.push(first + '.');
  if (f.director) parts.push(`It was directed by ${f.director}.`);
  if (f.cast?.length) parts.push(`Its billed cast includes ${list(f.cast.slice(0, 4))}.`);
  if (f.runtime) parts.push(`The listed running time is ${f.runtime} minutes.`);
  if (f.language) parts.push(`The original language code is ${f.language.toUpperCase()}.`);
  return parts.join(' ');
}

export interface MusicFacts { kind: 'song' | 'album' | 'artist'; name: string; artist?: string; album?: string; genre?: string; releaseDate?: string; trackCount?: number; durationMs?: number; country?: string }

export function musicSummary(f: MusicFacts): string {
  const year = f.releaseDate && !Number.isNaN(Date.parse(f.releaseDate)) ? new Date(f.releaseDate).getUTCFullYear() : undefined;
  const parts: string[] = [];
  if (f.kind === 'artist') {
    parts.push(`${f.name} is a recording artist${f.genre ? ` listed under the ${f.genre} genre` : ''}.`);
    return parts.join(' ');
  }
  const noun = f.kind === 'song' ? 'song' : 'album';
  let first = `${f.name} is a ${f.genre ? f.genre + ' ' : ''}${noun}`;
  if (f.artist) first += ` by ${f.artist}`;
  if (year) first += `, released in ${year}`;
  parts.push(first + '.');
  if (f.kind === 'song' && f.album) parts.push(`It appears on the release ${f.album}.`);
  if (f.kind === 'album' && f.trackCount) parts.push(`The album has ${f.trackCount} track${f.trackCount === 1 ? '' : 's'}.`);
  if (f.kind === 'song' && f.durationMs) { const m = Math.floor(f.durationMs / 60000); const s = String(Math.round((f.durationMs % 60000) / 1000)).padStart(2, '0'); parts.push(`The track runs ${m}:${s}.`); }
  return parts.join(' ');
}
