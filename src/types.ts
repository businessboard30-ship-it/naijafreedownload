export type Category = 'music' | 'movie' | 'independent' | 'documentary';

export interface Release {
  id: string;
  title: string;
  description: string;
  category: Category;
  creator: string;
  /** ISO date, e.g. 2025-03-14 */
  releaseDate: string;
  /** e.g. MP3, FLAC, MP4 */
  format: string;
  fileSizeMB: number;
  cover?: string;
  licence: { name: string; url: string };
  source: { name: string; url?: string };
  /** Must be an https URL authorised by the rights holder or licence. */
  downloadUrl: string;
}
