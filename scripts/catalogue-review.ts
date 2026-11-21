/**
 * Administrative review tool for the catalogue. Run with `npm run catalogue -- <command>`.
 *
 *   validate                       check the PUBLIC data files; exits 1 if any row would be quarantined
 *   pending                        list submissions in catalogue/submissions.json and what blocks each one
 *   approve <id> --by <name> --source-checked --rights-checked
 *                                  verify, approve and move a submission into the public data
 *   reject <id> --reason <text>    mark a submission rejected (stays out of public data)
 *   quarantine <id> --reason <t>   mark a submission quarantined (stays out of public data)
 *   takedown <id> --reason <text>  remove a published item and log it in catalogue/takedowns.json
 *
 * Ids: a release id, or "movie:<tmdbId>" for a movie download. Nothing here ever scrapes or
 * fetches anything: a human reviewer is always the one who decides.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { releaseProblems } from '../src/lib/catalogue';
import { movieDownloadProblems } from '../src/lib/movieDownloads';

const PUBLIC_RELEASES = 'public/data/releases.json';
const PUBLIC_MOVIES = 'public/data/movie-downloads.json';
const SUBMISSIONS = 'catalogue/submissions.json';
const TAKEDOWNS = 'catalogue/takedowns.json';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const write = (path: string, data: unknown) => writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
const today = () => new Date().toISOString().slice(0, 10);
const fail = (message: string): never => { console.error(message); process.exit(1); };

type Row = Record<string, any>;
const keyOf = (kind: 'release' | 'movie', row: Row) => (kind === 'movie' ? `movie:${row.movieId}` : String(row.id));
const problemsOf = (kind: 'release' | 'movie', row: Row) => (kind === 'movie' ? movieDownloadProblems(row) : releaseProblems(row));

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}
const has = (args: string[], name: string) => args.includes(`--${name}`);

function findSubmission(id: string) {
  const subs = read(SUBMISSIONS);
  const kind = id.startsWith('movie:') ? 'movie' : 'release';
  const list: Row[] = kind === 'movie' ? subs.movieDownloads : subs.releases;
  const row = list.find((r) => keyOf(kind, r) === id);
  return { subs, kind: kind as 'release' | 'movie', list, row };
}

const [command, id, ...rest] = process.argv.slice(2);

if (command === 'validate') {
  let bad = 0;
  const releases: Row[] = read(PUBLIC_RELEASES);
  const movies: Row[] = read(PUBLIC_MOVIES).movies ?? [];
  for (const r of releases) { const p = releaseProblems(r); if (p.length) { bad++; console.error(`releases.json "${r?.id}": ${p.join('; ')}`); } }
  for (const m of movies) { const p = movieDownloadProblems(m); if (p.length) { bad++; console.error(`movie-downloads.json movie ${m?.movieId}: ${p.join('; ')}`); } }
  console.log(`${releases.length} releases and ${movies.length} movie downloads checked; ${bad} problem item(s).`);
  process.exit(bad ? 1 : 0);
} else if (command === 'pending') {
  const subs = read(SUBMISSIONS);
  let n = 0;
  for (const [kind, rows] of [['release', subs.releases], ['movie', subs.movieDownloads]] as const) {
    for (const r of rows as Row[]) { n++; console.log(`${keyOf(kind, r)} (${r.verification?.reviewStatus ?? 'no status'}):\n  - ${problemsOf(kind, r).join('\n  - ') || 'ready to approve'}`); }
  }
  if (!n) console.log('No submissions waiting for review.');
} else if (command === 'approve') {
  const args = rest;
  const by = flag(args, 'by');
  if (!id || !by) fail('Usage: approve <id> --by <name> --source-checked --rights-checked');
  if (!has(args, 'source-checked') || !has(args, 'rights-checked')) fail('Refusing to approve: confirm with --source-checked and --rights-checked that you personally checked the source and the rights claim.');
  const { subs, kind, list, row } = findSubmission(id!);
  if (!row) fail(`No submission "${id}".`);
  const approved = { ...row!, verification: { ...row!.verification, sourceStatus: 'verified', reviewStatus: 'approved', reviewedBy: by, reviewedAt: today() } };
  const problems = problemsOf(kind, approved);
  if (problems.length) fail(`Cannot approve ${id}:\n  - ${problems.join('\n  - ')}`);
  if (kind === 'movie') { const pub = read(PUBLIC_MOVIES); pub.movies = [...(pub.movies ?? []).filter((m: Row) => m.movieId !== approved.movieId), approved]; write(PUBLIC_MOVIES, pub); }
  else { const pub: Row[] = read(PUBLIC_RELEASES); write(PUBLIC_RELEASES, [...pub.filter((r) => r.id !== approved.id), approved]); }
  list.splice(list.indexOf(row!), 1);
  write(SUBMISSIONS, subs);
  console.log(`Approved ${id}. Review the diff and open a pull request.`);
} else if (command === 'reject' || command === 'quarantine') {
  const reason = flag(rest, 'reason');
  if (!id || !reason) fail(`Usage: ${command} <id> --reason <text>`);
  const { subs, row } = findSubmission(id!);
  if (!row) fail(`No submission "${id}".`);
  row!.verification = { ...(row!.verification ?? {}), reviewStatus: command === 'reject' ? 'rejected' : 'quarantined', reviewedAt: today(), notes: reason };
  write(SUBMISSIONS, subs);
  console.log(`Marked ${id} as ${command === 'reject' ? 'rejected' : 'quarantined'}; it stays out of public data.`);
} else if (command === 'takedown') {
  const reason = flag(rest, 'reason');
  if (!id || !reason) fail('Usage: takedown <id> --reason <text>');
  const kind = id!.startsWith('movie:') ? 'movie' : 'release';
  let removed: Row | undefined;
  if (kind === 'movie') { const pub = read(PUBLIC_MOVIES); removed = (pub.movies ?? []).find((m: Row) => keyOf('movie', m) === id); pub.movies = (pub.movies ?? []).filter((m: Row) => keyOf('movie', m) !== id); if (removed) write(PUBLIC_MOVIES, pub); }
  else { const pub: Row[] = read(PUBLIC_RELEASES); removed = pub.find((r) => r.id === id); if (removed) write(PUBLIC_RELEASES, pub.filter((r) => r.id !== id)); }
  if (!removed) fail(`"${id}" is not in the public data.`);
  const log = read(TAKEDOWNS);
  log.takedowns.push({ id, title: removed!.title, removedAt: today(), reason });
  write(TAKEDOWNS, log);
  const subs = read(SUBMISSIONS);
  (kind === 'movie' ? subs.movieDownloads : subs.releases).push({ ...removed, verification: { ...removed!.verification, reviewStatus: 'taken-down', reviewedAt: today(), notes: reason } });
  write(SUBMISSIONS, subs);
  console.log(`Removed ${id} from public data and logged the takedown.`);
} else {
  fail('Commands: validate | pending | approve | reject | quarantine | takedown (see the header of scripts/catalogue-review.ts)');
}
