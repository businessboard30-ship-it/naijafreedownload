import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';
import { loadMovieDownloads, type MovieDownloadEntry } from '../lib/movieDownloads';

export default function DownloadCatalogue() {
  useSeo('Movie download catalogue', 'Browse movies with verified download links from TeraBox and other external file hosts.');
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
    <PageHeader title="Download catalogue">Movies with registered download files. Choose an available host such as TeraBox or another supported file platform. Only verified, authorised links are displayed.</PageHeader>
    <div className="toolbar" role="search">
      <div className="field grow"><label htmlFor="download-search">Find a movie</label><input id="download-search" type="search" placeholder="Search the download catalogue" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
    </div>
    {loading && <p className="muted">Loading download catalogue…</p>}
    {error && <p className="panel" role="alert">{error}</p>}
    {!loading && !error && <>
      <p className="muted small">{filtered.length} movies with verified download links</p>
      {filtered.length === 0
        ? <section className="panel"><h2>No download files listed yet</h2><p className="muted">The movie discovery catalogue is available, but no external file links have been registered here yet. Add authorised TeraBox or other HTTPS links to <code>public/data/movie-downloads.json</code> and they will appear here.</p></section>
        : <div className="grid">{filtered.map((item) => <article className="card release" key={item.movieId}>
          <div className="release-body"><p className="muted small">Movie · {item.year || 'Year not listed'}</p><h3>{item.title}</h3><p className="desc">{item.rightsNote}</p><div className="toolbar" style={{gap:8}}>{item.sources.map((source) => <a className="btn btn-primary" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">Download · {source.label}</a>)}</div></div>
        </article>)}</div>}
    </>}
    <p className="muted small">Movie metadata is separate from file hosting. TeraBox and other hosts are external services; NaijaFreeDownload does not store the files itself.</p>
  </>;
}
