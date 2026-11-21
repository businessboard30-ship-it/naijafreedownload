import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RIGHTS_BASIS_LABELS, hostOf } from '../lib/verification';
import { loadMovieDownloads, type MovieDownloadEntry, type MovieDownloadSource } from '../lib/movieDownloads';

export default function DownloadButton({ movieId, detail = false }: { movieId: number; detail?: boolean }) {
  const [entry, setEntry] = useState<MovieDownloadEntry | null>(null);
  const [checked, setChecked] = useState(false);
  const [selectedSource, setSelectedSource] = useState<MovieDownloadSource | null>(null);

  useEffect(() => {
    let active = true;
    loadMovieDownloads().then((items) => {
      if (active) { setEntry(items.find((item) => item.movieId === movieId) ?? null); setChecked(true); }
    }).catch(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, [movieId]);

  function continueToDownload() {
    if (!selectedSource) return;
    window.open(selectedSource.url, '_blank', 'noopener,noreferrer');
    setSelectedSource(null);
  }

  if (!detail) return <Link className="btn" to={`/movies/${movieId}`}>View details</Link>;
  if (!checked) return <span className="muted small">Checking download availability…</span>;
  if (!entry || !entry.sources.length) return <p className="muted" role="status">No verified download is available for this title. You can still read about it here.</p>;

  return <>
    <div className="download-sources" aria-label={`Download ${entry.title}`}>
      {entry.sources.map((source) => <button className="btn btn-download" type="button" key={source.url} onClick={() => setSelectedSource(source)}>Go to {source.label}</button>)}
    </div>
    <dl className="meta" style={{marginTop:12}}>
      <div><dt>Rights</dt><dd>{RIGHTS_BASIS_LABELS[entry.verification.rightsBasis]}: {entry.rightsNote}</dd></div>
      <div><dt>Official source</dt><dd><a href={entry.verification.officialUrl} target="_blank" rel="noopener noreferrer">{hostOf(entry.verification.officialUrl)}</a></dd></div>
      <div><dt>Reviewed</dt><dd>{entry.verification.reviewedAt}</dd></div>
    </dl>
    {selectedSource && <div className="download-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSource(null); }}>
      <section className="download-dialog" role="dialog" aria-modal="true" aria-labelledby="download-dialog-title">
        <button className="download-dialog-close" type="button" aria-label="Close" onClick={() => setSelectedSource(null)}>×</button>
        <p className="muted small">External download</p>
        <h2 id="download-dialog-title">Continue to your download</h2>
        <p className="muted">This file is provided by {selectedSource.label}. The link below opens the source in a new tab. Its availability and terms are set by that provider.</p>
        <div className="download-dialog-actions">
          <button className="btn" type="button" onClick={() => setSelectedSource(null)}>Back</button>
          <button className="btn btn-download" type="button" onClick={continueToDownload}>Open {selectedSource.label}</button>
        </div>
      </section>
    </div>}
  </>;
}
