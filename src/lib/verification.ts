/**
 * Content verification rules. Pure module: no browser or Vite APIs, so it can be
 * used by the site, the tests and the review CLI (scripts/catalogue-review.ts).
 *
 * Nothing is published unless every rule below passes. Anything that fails is
 * quarantined (kept out of every public listing) and reported with reasons.
 */

export const RIGHTS_BASES = ['public-domain', 'licensed', 'official-artist-label', 'authorised-distributor'] as const;
export type RightsBasis = (typeof RIGHTS_BASES)[number];

export const RIGHTS_BASIS_LABELS: Record<RightsBasis, string> = {
  'public-domain': 'Public domain',
  licensed: 'Licensed work',
  'official-artist-label': 'Official artist or label download',
  'authorised-distributor': 'Verified authorised distributor',
};

export const SOURCE_STATUSES = ['verified', 'unverified', 'rejected'] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const REVIEW_STATUSES = ['approved', 'pending', 'rejected', 'quarantined', 'taken-down'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export interface Verification {
  /** Why this work may legally be distributed. */
  rightsBasis: RightsBasis;
  /** Official page of the rights holder, label, archive or licensor for this work. */
  officialUrl: string;
  /** Has a reviewer confirmed the source and the rights claim? */
  sourceStatus: SourceStatus;
  /** Reviewer decision. Only `approved` is ever public. */
  reviewStatus: ReviewStatus;
  /** Name or handle of the person who reviewed it. */
  reviewedBy: string;
  /** ISO date (YYYY-MM-DD) of the review. */
  reviewedAt: string;
  /**
   * Required when the download is hosted on a different host than `officialUrl`:
   * https link to the rights holder's written statement that this host is authorised.
   */
  authorisationEvidenceUrl?: string;
  /** Free-text reviewer notes (never shown as a guarantee to visitors). */
  notes?: string;
}

const present = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;

export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function hostOf(value: string): string {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

const isIsoDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/**
 * Returns every reason the verification block cannot be published.
 * An empty array means the item is verified and approved.
 */
export function verificationProblems(raw: unknown, downloadUrls: string[]): string[] {
  const problems: string[] = [];
  if (!raw || typeof raw !== 'object') return ['verification block is missing'];
  const v = raw as Record<string, unknown>;

  if (!(RIGHTS_BASES as readonly unknown[]).includes(v.rightsBasis)) problems.push('rightsBasis must be one of: ' + RIGHTS_BASES.join(', '));
  if (!isHttpsUrl(v.officialUrl)) problems.push('officialUrl must be an https URL');
  if (v.sourceStatus !== 'verified') problems.push(`sourceStatus is "${String(v.sourceStatus)}", must be "verified"`);
  if (v.reviewStatus !== 'approved') problems.push(`reviewStatus is "${String(v.reviewStatus)}", must be "approved"`);
  if (!present(v.reviewedBy)) problems.push('reviewedBy is required');
  if (!isIsoDate(v.reviewedAt)) problems.push('reviewedAt must be a YYYY-MM-DD date');

  if (downloadUrls.length === 0) problems.push('at least one download URL is required');
  for (const url of downloadUrls) {
    if (!isHttpsUrl(url)) { problems.push(`download URL is not https: ${String(url)}`); continue; }
    // A third-party host is never assumed to be authorised.
    const sameHost = isHttpsUrl(v.officialUrl) && hostOf(url) === hostOf(v.officialUrl);
    if (!sameHost && !isHttpsUrl(v.authorisationEvidenceUrl)) {
      problems.push(`download host ${hostOf(url)} differs from the official source; authorisationEvidenceUrl is required`);
    }
  }
  return problems;
}

export const isVerified = (raw: unknown, downloadUrls: string[]) => verificationProblems(raw, downloadUrls).length === 0;

export interface Classified<T> { approved: T[]; quarantined: { item: unknown; problems: string[] }[] }

/** Split raw catalogue rows into publishable and quarantined. `check` returns problems for one row. */
export function classify<T>(rows: unknown, check: (row: unknown) => string[]): Classified<T> {
  const out: Classified<T> = { approved: [], quarantined: [] };
  if (!Array.isArray(rows)) return out;
  for (const row of rows) {
    const problems = check(row);
    if (problems.length === 0) out.approved.push(row as T); else out.quarantined.push({ item: row, problems });
  }
  return out;
}
