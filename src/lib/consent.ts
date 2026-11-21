import { useSyncExternalStore } from 'react';

export type Consent = 'granted' | 'denied' | null;
const KEY = 'nfd_ad_consent_v1';
const EVENT = 'nfd-consent-change';

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch { return null; }
}
export function writeConsent(value: Consent) {
  try {
    if (value) window.localStorage.setItem(KEY, value); else window.localStorage.removeItem(KEY);
  } catch { /* storage unavailable: choice simply is not remembered */ }
  window.dispatchEvent(new Event(EVENT));
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb); };
};
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, readConsent, () => null);
}
