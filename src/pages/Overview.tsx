import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ReleaseCard from '../components/ReleaseCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { useCatalogue } from '../lib/CatalogueContext';
import { useSeo } from '../lib/useSeo';

const destinations = [
  {to:'/movies',title:'Explore movies',description:'Browse trending films, worldwide cinema, genres and countries.'},
  {to:'/music',title:'Discover music',description:'See popular songs and albums by region, or search for an artist.'},
  {to:'/search',title:'Search everything',description:'Look across movies, music and approved independent releases.'},
];

export default function Overview() {
  useSeo('Overview', 'Discover worldwide movies, popular music, artists and legally available independent downloads.');
  const { state, reload } = useCatalogue();
  const head = <PageHeader title="Discover entertainment">Explore movies, music and independent releases from around the world. Browse international charts, find films across countries and languages, and check where content is legally available.</PageHeader>;
  if (state.status === 'loading') return <>{head}<LoadingState /></>;
  if (state.status === 'error') return <>{head}<ErrorState message={state.message} onRetry={reload} /></>;
  const rel = state.releases;
  const latest = [...rel].sort((a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate)).slice(0, 4);

  return (
    <>
      {head}
      <section aria-labelledby="discover-heading">
        <div className="section-head"><h2 id="discover-heading">Start exploring</h2></div>
        <div className="grid">
          {destinations.map(item=><Link className="card release" key={item.to} to={item.to} style={{textDecoration:'none',padding:24}}>
            <div className="release-body"><h3>{item.title}</h3><p className="desc">{item.description}</p><span>Explore</span></div>
          </Link>)}
        </div>
      </section>
      <section aria-labelledby="latest">
        <div className="section-head"><h2 id="latest">Latest authorised downloads</h2><Link to="/latest">View catalogue</Link></div>
        {rel.length === 0 ? (
          <EmptyState title="The direct-download catalogue is being built">
            Movie and music discovery is already available in the sections above. Direct downloads appear here only after a rights holder or authorised archive provides a verified download link. If you publish content, you can <Link to="/creators">submit a release for review</Link>.
          </EmptyState>
        ) : <div className="grid">{latest.map((r) => <ReleaseCard key={r.id} r={r} />)}</div>}
      </section>
      <section aria-labelledby="how" className="panel">
        <h2 id="how">How downloads work</h2>
        <p>We distinguish discovery from downloading. Movie and music catalogues help you find titles; a direct download is enabled only when the file is public domain, creator-authorised or properly licensed.</p>
        <p><Link to="/copyright">Read our copyright and takedown policy</Link> · <Link to="/creators">Submit a release</Link></p>
      </section>
    </>
  );
}
