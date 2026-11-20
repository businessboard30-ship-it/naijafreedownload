import { useEffect, useState } from 'react';
import { loadMovieDownloads, type MovieDownloadEntry } from '../lib/movieDownloads';

export default function DownloadButton({ movieId }: { movieId: number }) {
  const [entry, setEntry] = useState<MovieDownloadEntry | null>(null);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    loadMovieDownloads().then((items) => {
      if (active) {
        setEntry(items.find((item) => item.movieId === movieId) ?? null);
        setChecked(true);
      }
    }).catch(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, [movieId]);
  if (!checked) return <span className="muted small">Checking download…</span>;
  if (!entry || !entry.sources.length) return <>
    <button className="btn" type="button" onClick={() => setMessage('Gosh, is this hard to ask? This movie file has not been added yet.')}>Download</button>
    {message && <p className="muted small" role="status" style={{marginTop:8}}>{message}</p>}
  </>;
  return <div className="toolbar" aria-label={`Download ${entry.title}`} style={{gap:8}}>
    {entry.sources.map((source) => <a className="btn btn-primary" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">Download · {source.label}</a>)}
  </div>;
}
