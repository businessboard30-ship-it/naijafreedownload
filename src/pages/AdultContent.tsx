import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ReleaseCard from '../components/ReleaseCard';
import { useCatalogue } from '../lib/CatalogueContext';
import { useSeo } from '../lib/useSeo';

const CONSENT_KEY = 'naijafreedownload-adult-consent-v1';

export default function AdultContent() {
  useSeo('18+ content', 'Age-restricted section for lawful, consensual, rights-holder-authorised adult releases.');
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const { state } = useCatalogue();

  useEffect(() => {
    try { setAllowed(sessionStorage.getItem(CONSENT_KEY) === 'yes'); } catch { setAllowed(false); }
  }, []);

  const continueToSection = () => {
    if (!checked) return;
    try { sessionStorage.setItem(CONSENT_KEY, 'yes'); } catch { /* Consent remains active for this view only. */ }
    setAllowed(true);
  };

  if (!allowed) return (
    <>
      <PageHeader title="18+ content">An age-restricted area, kept separate from the main entertainment catalogue.</PageHeader>
      <section className="panel prose" aria-labelledby="adult-gate-title">
        <p className="muted small">AGE-RESTRICTED · ADULTS ONLY</p>
        <h2 id="adult-gate-title">Please confirm your age</h2>
        <p>This section is intended only for adults aged 18 or older (or the higher age required where you live). It may contain adult-oriented titles and descriptions.</p>
        <p>By continuing, you confirm that you meet the age requirement and that viewing this category is lawful where you are. This is a self-declaration, not formal identity or age verification.</p>
        <label style={{display:'flex',gap:10,alignItems:'flex-start',margin:'20px 0'}}>
          <input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)} />
          <span>I confirm that I am at least 18 years old and agree to view this section.</span>
        </label>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-primary" type="button" disabled={!checked} onClick={continueToSection}>Continue to 18+ section</button>
          <Link className="btn" to="/">Leave this section</Link>
        </div>
        <p className="muted small" style={{marginTop:18}}>Your confirmation is kept in this browser tab's session storage and is cleared when the session ends. It does not establish legal age.</p>
      </section>
    </>
  );

  const releases = state.status === 'ready' ? state.releases.filter(r => r.category === 'adult') : [];
  return (
    <>
      <PageHeader title="18+ content">Adult-oriented releases, separated from the general catalogue.</PageHeader>
      <section className="panel prose">
        <p>This section accepts only lawful material involving consenting adults, submitted by the rights holder or an authorised distributor. We do not accept sexual content involving minors, non-consensual material, hidden-camera content, intimate imagery shared without permission, or deceptive/deepfake sexual imagery.</p>
        <p>Every downloadable listing must include a verifiable rights statement and an authorised HTTPS source. We do not host or link to pirated copies. <Link to="/creators">Creator submission requirements</Link> · <Link to="/copyright">Report a rights or safety concern</Link>.</p>
      </section>
      {state.status === 'loading' && <p className="muted" role="status">Loading approved listings…</p>}
      {state.status === 'error' && <p className="panel" role="alert">{state.message}</p>}
      {state.status === 'ready' && (releases.length
        ? <div className="grid">{releases.map(r=><ReleaseCard key={r.id} r={r}/>)}</div>
        : <div className="state"><h2>No approved 18+ releases yet</h2><p>This section is active, but no adult listings have passed rights and safety review. No third-party adult links are automatically imported.</p><Link to="/contact">Contact the team about a submission</Link></div>)}
    </>
  );
}
