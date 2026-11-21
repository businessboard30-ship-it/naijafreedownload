import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePageSeo } from '../lib/useSeo';
import { loadMovieDownloads, type MovieDownloadEntry } from '../lib/movieDownloads';
import DownloadButton from '../components/DownloadButton';

export default function DownloadCatalogue() {
  usePageSeo();
  const [entries, setEntries] = useState<MovieDownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    let active = true;
    loadMovieDownloads().then((items) => { if (active) setEntries(items); })
      .catch(() => { if (active) setError('The download catalogue could not be loaded. Please try again later.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const filtered = entries.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));
  return <>
    <PageHeader title="Download catalogue">Movies whose download source has passed rights and source verification by a reviewer. Nothing appears here until it has been approved.</PageHeader>
    <div className="toolbar" role="search">
      <div className="field grow"><label htmlFor="download-search">Find a movie</label><input id="download-search" type="search" placeholder="Search the download catalogue" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    </div>
    {loading && <p className="muted">Loading download catalogue…</p>}
    {error && <p className="panel" role="alert">{error}</p>}
    {!loading && !error && <>
      <p className="muted small">{filtered.length} movies with verified download links</p>
      {filtered.length === 0
        ? <section className="panel"><h2>No verified downloads yet</h2><p className="muted">Titles appear here only after a reviewer has confirmed the rights and the source. You can still explore films on the <Link to="/movies">Movies</Link> page. Rights holders can <Link to="/creators">submit a release for review</Link>.</p></section>
        : <div className="grid">{filtered.map((item) => <article className="card release" key={item.movieId}>
          <div className="release-body"><p className="muted small">Movie · {item.year || 'Year not listed'}</p><h3>{item.title}</h3><p className="desc">{item.rightsNote}</p><DownloadButton movieId={item.movieId} /></div>
        </article>)}</div>}
    </>}
    <p className="muted small">Movie metadata is separate from file hosting. Files are provided by the external sources shown; NaijaFreeDownload does not store them.</p>
  </>;
}
