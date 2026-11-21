import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ConsentBanner from '../components/ConsentBanner';
import { ADS } from '../config/ads';
import { writeConsent } from '../lib/consent';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setOpen(false);
    if (first.current) { first.current = false; return; }
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Topbar menuOpen={open} onMenu={() => setOpen((o) => !o)} />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <main id="main" ref={main} tabIndex={-1} className="main">
        <div className="content"><Outlet /></div>
        <footer className="footer">
          <span>NaijaFreeDownload lists only public-domain, creator-authorised or licensed content for download.</span>
          <ul className="footer-links" aria-label="Site information">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms and Conditions</Link></li>
            <li><Link to="/copyright">Copyright and takedown</Link></li>
            {ADS.enabled && <li><button className="link-button" type="button" onClick={() => writeConsent(null)}>Ad cookie choices</button></li>}
          </ul>
        </footer>
      </main>
      <ConsentBanner />
    </>
  );
}
