import { NavLink } from 'react-router-dom';
import { NAV } from '../config/site';

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <nav id="sidebar" className={`sidebar${open ? ' open' : ''}`} aria-label="Main">
        {NAV.map((g) => (
          <div className="nav-group" key={g.group}>
            <h2 className="nav-heading">{g.group}</h2>
            <ul>
              {g.items.map((i) => (
                <li key={i.to}><NavLink to={i.to} end={i.end} className="nav-link">{i.label}</NavLink></li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {open && <div className="scrim" onClick={onClose} aria-hidden="true" />}
    </>
  );
}
