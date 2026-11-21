/** Pure advertising helpers (no browser or Vite APIs) so they can be unit tested and used by build scripts. */

export const PUBLISHER_ID_PATTERN = /^ca-pub-\d{10,20}$/;
export const SLOT_ID_PATTERN = /^\d{6,20}$/;

/** Returns the publisher ID only when it is a well-formed AdSense ID; otherwise an empty string. Never invents one. */
export function parsePublisherId(value: unknown): string {
  const id = typeof value === 'string' ? value.trim() : '';
  return PUBLISHER_ID_PATTERN.test(id) ? id : '';
}
export function parseSlotId(value: unknown): string {
  const id = typeof value === 'string' ? value.trim() : '';
  return SLOT_ID_PATTERN.test(id) ? id : '';
}

/** Content of /ads.txt for a publisher ID, in the format Google documents. Empty when no valid ID is set. */
export function adsTxtFor(publisherId: unknown): string {
  const id = parsePublisherId(publisherId);
  return id ? `google.com, ${id.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n` : '';
}

/**
 * Ads may only appear on pages with substantial original content. Never on utility, policy, search,
 * download, contact or error pages, and never on screens whose main purpose is a download.
 */
const AD_FRIENDLY = [
  /^\/movies\/\d+$/,
  /^\/tv\/\d+$/,
  /^\/music\/(song|album|artist)\/\d+$/,
  /^\/anime\/\d+$/,
  /^\/people\/\d+$/,
];
export function adsAllowedOnPath(pathname: string): boolean {
  return AD_FRIENDLY.some((re) => re.test(pathname));
}

export interface AdsConfig { enabled: boolean; publisherId: string; slotId: string }
/** Ads render only when explicitly enabled AND a valid publisher ID and slot ID are configured. */
export function resolveAdsConfig(env: { enabled?: unknown; publisherId?: unknown; slotId?: unknown }): AdsConfig {
  const publisherId = parsePublisherId(env.publisherId);
  const slotId = parseSlotId(env.slotId);
  return { enabled: env.enabled === 'true' && !!publisherId && !!slotId, publisherId, slotId };
}
