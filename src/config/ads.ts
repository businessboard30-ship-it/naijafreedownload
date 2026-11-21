import { resolveAdsConfig } from '../lib/ads';

/**
 * Advertising is OFF unless all three variables are set (see .env.example). Do not set
 * VITE_ADS_ENABLED=true until Google has approved the site for AdSense.
 */
export const ADS = resolveAdsConfig({
  enabled: import.meta.env.VITE_ADS_ENABLED,
  publisherId: import.meta.env.VITE_ADSENSE_CLIENT,
  slotId: import.meta.env.VITE_ADSENSE_SLOT_DETAIL,
});
