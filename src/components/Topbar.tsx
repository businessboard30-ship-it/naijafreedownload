import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SITE_NAME } from '../config/site';

export default function Topbar({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };
  return (
    <header className="topbar">
      <button className="menu-btn" aria-label="Menu" aria-expanded={menuOpen} aria-controls="sidebar" onClick={onMenu}>
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <Link to="/" className="brand">
        <svg width="24" height="24" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#ff5e1f" /><path d="M9 23V9h3l8 10V9h3v14h-3l-8-10v10z" fill="#fff" /></svg>
        <span>{SITE_NAME}</span>
      </Link>
      <form className="top-search" role="search" onSubmit={submit}>
        <label htmlFor="top-q" className="sr-only">Search releases</label>
        <input id="top-q" type="search" placeholder="Search releases" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>
      <Link className="top-link" to="/copyright">Takedown</Link>
    </header>
  );
}