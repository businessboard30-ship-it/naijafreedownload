import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import ReleaseCard from '../components/ReleaseCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { CATEGORY_LABELS, SORT_LABELS, facets, queryReleases, type SortKey } from '../lib/catalogue';
import { useCatalogue } from '../lib/CatalogueContext';
import { useSeo } from '../lib/useSeo';

interface Props { title: string; description: string; category?: Category; latest?: boolean; showSearch?: boolean; showCategory?: boolean }

export default function CatalogueView({ title, description, category, latest, showSearch, showCategory }: Props) {
  useSeo(title, description);
  const { state, reload } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const get = (k: string) => params.get(k) ?? '';
  const sortParam = get('sort');
  const sort: SortKey = sortParam in SORT_LABELS ? (sortParam as SortKey) : 'newest';
  const catParam = get('category');
  const activeCat = category ?? ((catParam in CATEGORY_LABELS ? catParam : '') as Category | '');
  const page = Math.max(1, parseInt(get('page'), 10) || 1);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const intro = <PageHeader title={title}>{description}</PageHeader>;
  if (state.status === 'loading') return <>{intro}<LoadingState /></>;
  if (state.status === 'error') return <>{intro}<ErrorState message={state.message} onRetry={reload} /></>;

  const all = state.releases;
  const scoped = category ? all.filter((r) => r.category === category) : all;
  if (all.length === 0) {
    return <>{intro}<EmptyState title="No direct downloads listed here yet">
      This section is reserved for verified downloads submitted by rights holders or authorised archives. You can still <Link to="/movies">discover worldwide movies</Link> and <Link to="/music">explore music charts and search artists</Link>. Creators can <Link to="/creators">submit a release for review</Link>.
    </EmptyState></>;
  }

  const { formats, licences } = facets(scoped);
  const result = queryReleases(all, { q: get('q'), category: activeCat, format: get('format'), licence: get('licence'), sort: latest ? 'newest' : sort, page });
  const filtered = !!(get('q') || get('format') || get('licence') || (showCategory && activeCat));

  return (
    <>
      {intro}
      <form className="toolbar" role="search" aria-label={`Filter ${title}`} onSubmit={(e) => e.preventDefault()}>
        {showSearch && (
          <div className="field grow"><label htmlFor="f-q">Search</label>
            <input id="f-q" type="search" value={get('q')} onChange={(e) => update({ q: e.target.value })} placeholder="Title, creator or description" /></div>
        )}
        {showCategory && (
          <div className="field"><label htmlFor="f-cat">Category</label>
            <select id="f-cat" value={activeCat} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
        )}
        <div className="field"><label htmlFor="f-format">Format</label>
          <select id="f-format" value={get('format')} onChange={(e) => update({ format: e.target.value })}>
            <option value="">All formats</option>{formats.map((f) => <option key={f}>{f}</option>)}
          </select></div>
        <div className="field"><label htmlFor="f-lic">Licence</label>
          <select id="f-lic" value={get('licence')} onChange={(e) => update({ licence: e.target.value })}>
            <option value="">All licences</option>{licences.map((l) => <option key={l}>{l}</option>)}
          </select></div>
        {!latest && (
          <div className="field"><label htmlFor="f-sort">Sort by</label>
            <select id="f-sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
              {Object.entries(SORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
        )}
      </form>
      <p className="muted small count" aria-live="polite">{result.total} {result.total === 1 ? 'release' : 'releases'}</p>
      {result.total === 0 ? (
        <EmptyState title={filtered ? 'No matching releases' : `No ${title.toLowerCase()} yet`}
          action={filtered ? <button className="btn" onClick={() => setParams({}, { replace: true })}>Clear filters</button> : <Link className="btn" to="/creators">Submit a release</Link>}>
          {filtered ? 'Try a different search term or remove a filter.' : <>This section contains verified direct downloads, not the full discovery catalogue. Try <Link to="/movies">Movies</Link> or <Link to="/music">Music</Link> to explore worldwide titles.</>}
        </EmptyState>
      ) : (
        <>
          <div className="grid">{result.items.map((r) => <ReleaseCard key={r.id} r={r} />)}</div>
          <Pagination page={result.page} pageCount={result.pageCount} onChange={(p) => { update({ page: p === 1 ? '' : String(p) }); window.scrollTo(0, 0); }} />
        </>
      )}
    </>
  );
}
