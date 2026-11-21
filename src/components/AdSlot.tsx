import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ADS } from '../config/ads';
import { adsAllowedOnPath } from '../lib/ads';
import { useConsent } from '../lib/consent';

declare global { interface Window { adsbygoogle?: unknown[] } }

let scriptRequested = false;
function loadAdSenseScript(publisherId: string) {
  if (scriptRequested) return;
  scriptRequested = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
  document.head.appendChild(s);
}

/**
 * The only place an advertisement can appear. Renders nothing unless advertising is configured, the
 * visitor has accepted ad cookies and the page is a content page. It is always clearly labelled and
 * must be placed away from download, navigation and other controls (see docs/ADSENSE.md).
 */
export default function AdSlot() {
  const { pathname } = useLocation();
  const consent = useConsent();
  const pushed = useRef(false);
  const visible = ADS.enabled && consent === 'granted' && adsAllowedOnPath(pathname);

  useEffect(() => {
    if (!visible || pushed.current) return;
    loadAdSenseScript(ADS.publisherId);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); pushed.current = true; } catch { /* ad blocked or failed: nothing to show */ }
  }, [visible]);

  if (!visible) return null;
  return (
    <aside className="ad-slot" aria-label="Advertisement">
      <p className="ad-label">Advertisement</p>
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADS.publisherId} data-ad-slot={ADS.slotId} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
