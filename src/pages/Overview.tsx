import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ReleaseCard from '../components/ReleaseCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { CATEGORY_LABELS } from '../lib/catalogue';
import { useCatalogue } from '../lib/CatalogueContext';
import { useSeo } from '../lib/useSeo';
import type { Category } from '../types';

const ROUTES: Record<Category, string> = { music: '/music', movie: '/movies', independent: '/independent', documentary: '/documentaries' };

export default function Overview() {
  useSeo('Overview', 'Discover music, films and documentaries from around the world, with clear rights information and links to legally available downloads.');
  const { state, reload } = useCatalogue();
  const head = <PageHeader title="Overview">Discover music, movies and documentaries from around the world. Explore titles across countries, languages, genres and cultures, and find downloads that are public domain, creator-authorised or properly licensed.</PageHeader>;
  if (state.status === 'loading') return <>{head}<LoadingState /></>;
  if (state.status === 'error') return <>{head}<ErrorState message={state.message} onRetry={reload} /></>;
  const rel = state.releases;
  const latest = [...rel].sort((a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate)).slice(0, 4);

  return (
    <>
      {head}
      <section aria-labelledby="cats" className="panel">
        <h2 id="cats">Explore the catalogue</h2>
        <ul className="stats">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
            <li key={c}><Link to={ROUTES[c]}>{CATEGORY_LABELS[c]}</Link><strong>{rel.filter((r) => r.category === c).length}</strong></li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="latest">
        <div className="section-head"><h2 id="latest">Latest releases</h2>{rel.length > 0 && <Link to="/latest">View all</Link>}</div>
        {rel.length === 0 ? (
          <EmptyState title="No releases yet" action={<Link className="btn" to="/creators">Submit a release</Link>}>
            The catalogue is ready. Approved public-domain, creator-authorised and licensed releases from around the world will appear here.
          </EmptyState>
        ) : <div className="grid">{latest.map((r) => <ReleaseCard key={r.id} r={r} />)}</div>}
      </section>
      <section aria-labelledby="rules" className="panel">
        <h2 id="rules">What can be listed</h2>
        <p>Every release needs a named licence or written permission, a link to the licence, and a download hosted by the rights holder or an archive that carries the work legally. Releases missing any of these are not shown.</p>
        <p><Link to="/creators">Read the submission requirements</Link></p>
      </section>
    </>
  );
}
