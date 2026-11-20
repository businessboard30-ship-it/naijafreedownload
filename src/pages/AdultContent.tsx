import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';

type AdultMovie = {
  id: number;
  title: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average?: number;
  adult?: boolean;
  genre_ids?: number[];
};
type MovieResults = { results: AdultMovie[]; total_results: number; total_pages: number };
type Preview = { key: string; name: string; site: string; type: string; official?: boolean };
const image = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';

const INTENSITY_LABEL = 'Awaiting review';

export default function AdultContent() {
  useSeo('18+ adult movie catalogue', 'A separate, age-restricted discovery catalogue for adult-flagged film titles.');
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState<MovieResults | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdultMovie | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try { setAllowed(sessionStorage.getItem('naijafreedownload-adult-consent-v1') === 'yes'); }
    catch { setAllowed(false); }
  }, []);

  const continueToSection = () => {
    if (!checked) return;
    try { sessionStorage.setItem('naijafreedownload-adult-consent-v1', 'yes'); } catch { /* session-only fallback */ }
    setAllowed(true);
  };

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const path = query.trim() ? 'search/movie' : 'discover/movie';
    const params = new URLSearchParams({ page: String(page), include_adult: 'true', language: 'en-US' });
    if (query.trim()) params.set('query', query.trim().slice(0, 100));
    else params.set('sort_by', 'popularity.desc');
    setData(null);
    setError('');
    fetch('/api/tmdb/' + path + '?' + params.toString(), { signal: controller.signal })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'The adult-title catalogue is temporarily unavailable.');
        return payload as MovieResults;
      })
      .then(payload => {
        // Keep this route isolated: only titles explicitly flagged as adult by the metadata provider are eligible.
        setData({ ...payload, results: (payload.results || []).filter(movie => movie.adult === true) });
      })
      .catch(reason => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, [allowed, page, query]);

  useEffect(() => {
    if (!selected) { setPreviews([]); return; }
    const controller = new AbortController();
    setPreviewLoading(true);
    fetch('/api/tmdb/movie/' + selected.id + '/videos', { signal: controller.signal })
      .then(async response => response.ok ? response.json() : { results: [] })
      .then(payload => setPreviews((payload.results || []).filter((video: Preview) => video.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip'].includes(video.type)).slice(0, 4)))
      .catch(reason => { if (reason.name !== 'AbortError') setPreviews([]); })
      .finally(() => { if (!controller.signal.aborted) setPreviewLoading(false); });
    return () => controller.abort();
  }, [selected]);

  const movies = useMemo(() => data?.results ?? [], [data]);

  if (!allowed) return (
    <>
      <PageHeader title="18+ content">A separate age-restricted catalogue. It is not mixed with the general Movies, Nigeria Movies or search results.</PageHeader>
      <section className="panel prose" aria-labelledby="adult-gate-title">
        <p className="muted small">AGE-RESTRICTED · ADULTS ONLY</p>
        <h2 id="adult-gate-title">Confirm before entering</h2>
        <p>This section is intended only for adults aged 18 or older, or the higher legal age required where you live. It may contain adult-oriented film titles and descriptions.</p>
        <p>By continuing, you confirm that viewing this category is lawful where you are. This self-declaration is not formal identity or age verification.</p>
        <label style={{display:'flex',gap:10,alignItems:'flex-start',margin:'20px 0'}}>
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>I confirm that I meet the age requirement and wish to enter the 18+ catalogue.</span>
        </label>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-primary" type="button" disabled={!checked} onClick={continueToSection}>Continue</button>
          <Link className="btn" to="/">Leave this section</Link>
        </div>
        <p className="muted small" style={{marginTop:18}}>Your confirmation lasts for this browser session only. It does not prove your age.</p>
      </section>
    </>
  );

  return (
    <>
      <PageHeader title="18+ adult movies">A distinct catalogue of titles marked as adult by the metadata provider. Mainstream R-rated films are not automatically included.</PageHeader>
      <section className="panel prose">
        <p>Listings are discovered from TMDB's adult-title metadata flag. This is a metadata catalogue—not a video host or a source of pirated downloads. Posters and artwork are supplied by TMDB. Only official YouTube trailers or clips are shown when the title has them.</p>
        <p><strong>Intensity:</strong> titles are marked “Awaiting review” until a licensed content-rating source or a human reviewer verifies the level. The adult flag alone does not reliably distinguish mild, moderate, high or explicit content, so the site will not invent an intensity score.</p>
        <p>We will only import media previews or download destinations when the rights holder or authorised distributor permits that use. No scraping of random adult sites, leaked content, or unauthorised copies.</p>
      </section>
      <div className="toolbar" style={{alignItems:'end'}}>
        <div className="field grow">
          <label htmlFor="adult-title-search">Search adult-flagged titles</label>
          <input id="adult-title-search" type="search" value={query} placeholder="Search title…" onChange={event => { setQuery(event.target.value); setPage(1); setSelected(null); }} />
        </div>
      </div>
      {error && <p className="panel" role="alert">{error}</p>}
      {!data && !error && <p className="muted" role="status">Loading adult-flagged titles…</p>}
      {data && (movies.length ? <>
        <p className="muted small">{data.total_results.toLocaleString()} results reported by the metadata provider · Page {page} of {Math.min(data.total_pages, 500)}</p>
        <div className="grid">
          {movies.map(movie => <article className="card release" key={movie.id}>
            {movie.poster_path ? <img className="cover" src={image(movie.poster_path)} alt={movie.title + ' poster'} loading="lazy" /> : <div className="cover cover-empty">Artwork unavailable</div>}
            <div className="release-body">
              <p className="muted small">18+ · Adult-flagged · {INTENSITY_LABEL}</p>
              <h3>{movie.title}</h3>
              <p className="muted small">{movie.release_date?.slice(0, 4) || 'Year unavailable'} · ★ {movie.vote_average?.toFixed(1) || '—'}</p>
              <p className="desc">{movie.overview || 'No synopsis supplied.'}</p>
              <button className="btn" type="button" onClick={() => setSelected(movie)}>View details & previews</button>
            </div>
          </article>)}
        </div>
        <div className="toolbar">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
          <span className="muted small">Page {page} of {Math.min(data.total_pages, 500)}</span>
          <button className="btn" disabled={page >= data.total_pages || page >= 500} onClick={() => setPage(value => value + 1)}>Next</button>
        </div>
      </> : <div className="state"><h2>No adult-flagged titles found</h2><p>The metadata provider may not have adult titles available for this search or region. This section will not fill itself with ordinary mature-rated movies just to make the catalogue look busy.</p></div>)}

      {selected && <section className="panel prose" aria-labelledby="adult-detail-title">
        <div className="toolbar" style={{justifyContent:'space-between',alignItems:'center'}}>
          <h2 id="adult-detail-title">{selected.title}</h2>
          <button className="btn" type="button" onClick={() => setSelected(null)}>Close details</button>
        </div>
        {selected.backdrop_path && <img src={image(selected.backdrop_path, 'w1280')} alt={selected.title + ' backdrop'} loading="lazy" style={{width:'100%',maxHeight:360,objectFit:'cover',borderRadius:10}} />}
        <p>{selected.overview || 'No synopsis supplied.'}</p>
        <p><strong>Classification:</strong> Adult-flagged by TMDB · Intensity awaiting review</p>
        <p><strong>Release year:</strong> {selected.release_date?.slice(0,4) || 'Not listed'}</p>
        <h3>Official previews</h3>
        {previewLoading && <p className="muted">Checking for official previews…</p>}
        {!previewLoading && previews.length === 0 && <p className="muted">No official YouTube trailer or clip is listed for this title. We do not substitute scraped or unauthorised clips.</p>}
        {previews.map(video => <div key={video.key} style={{margin:'18px 0'}}>
          <p><strong>{video.name || video.type}</strong> · {video.type}{video.official ? ' · Official' : ''}</p>
          <div style={{position:'relative',paddingTop:'56.25%'}}>
            <iframe title={video.name || selected.title + ' preview'} src={'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(video.key)} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,borderRadius:8}} />
          </div>
          <a href={'https://www.youtube.com/watch?v=' + encodeURIComponent(video.key)} target="_blank" rel="noopener noreferrer">Open preview on YouTube</a>
        </div>)}
        <p className="muted small">Metadata and artwork by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </section>}
      <p className="muted small">This catalogue uses TMDB's include_adult discovery option and filters out results not explicitly marked adult. TMDB does not supply a licence to redistribute films, images or clips; rights must be confirmed separately.</p>
    </>
  );
}
