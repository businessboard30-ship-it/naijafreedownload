import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadMovieDownloads, type MovieDownloadEntry, type MovieDownloadSource } from '../lib/movieDownloads';

const AD_SLOTS = ['Sponsor placement 1', 'Sponsor placement 2', 'Sponsor placement 3'];

export default function DownloadButton({ movieId, detail = false }: { movieId: number; detail?: boolean }) {
  const [entry, setEntry] = useState<MovieDownloadEntry | null>(null);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
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

  if (!detail) return <Link className="btn btn-download" to={`/movies/${movieId}`}>Download</Link>;
  if (!checked) return <span className="muted small">Checking download availability…</span>;
  if (!entry || !entry.sources.length) return <>
    <button className="btn btn-download" type="button" onClick={() => setMessage('An authorised download link has not been added yet. Please check back soon.')}>Download</button>
    {message && <p className="muted small" role="status" style={{marginTop:8}}>{message}</p>}
  </>;

  return <>
    <div className="download-sources" aria-label={`Download ${entry.title}`}>
      {entry.sources.map((source) => <button className="btn btn-download" type="button" key={source.url} onClick={() => setSelectedSource(source)}>Download · {source.label}</button>)}
    </div>
    {selectedSource && <div className="download-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSource(null); }}>
      <section className="download-dialog" role="dialog" aria-modal="true" aria-labelledby="download-dialog-title">
        <button className="download-dialog-close" type="button" aria-label="Close" onClick={() => setSelectedSource(null)}>×</button>
        <p className="muted small">DOWNLOAD</p>
        <h2 id="download-dialog-title">Continue to your download</h2>
        <p className="muted">Your selected file is hosted on {selectedSource.label}. Sponsor placements are shown below when advertising is configured.</p>
        <div className="download-ad-grid">
          {AD_SLOTS.map((slot) => <div className="download-ad-slot" key={slot}>
            <span className="download-ad-label">ADVERTISEMENT</span>
            <strong>{slot}</strong>
            <span className="muted small">Ad space available</span>
          </div>)}
        </div>
        <p className="muted small">Ad placements are optional and will not require visitors to click advertisements to access a download.</p>
        <div className="download-dialog-actions">
          <button className="btn" type="button" onClick={() => setSelectedSource(null)}>Back</button>
          <button className="btn btn-download" type="button" onClick={continueToDownload}>Continue to {selectedSource.label}</button>
        </div>
      </section>
    </div>}
  </>;
}
