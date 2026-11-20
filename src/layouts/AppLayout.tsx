import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

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
          <span>NaijaFreeDownload lists only public-domain, creator-authorised or licensed content.</span>
        </footer>
      </main>
    </>
  );
}
