import type { Release } from '../types';
import { CATEGORY_LABELS, formatDate, formatSize } from '../lib/catalogue';

export default function ReleaseCard({ r }: { r: Release }) {
  return (
    <article className="card release">
      {r.cover
        ? <img className="cover" src={r.cover} alt={`Cover for ${r.title}`} width="320" height="320" loading="lazy" decoding="async" />
        : <div className="cover cover-empty" aria-hidden="true">{r.title.slice(0, 1)}</div>}
      <div className="release-body">
        <p className="muted small">{CATEGORY_LABELS[r.category]}</p>
        <h3>{r.title}</h3>
        <p className="small">{r.creator}</p>
        <p className="desc">{r.description}</p>
        <dl className="meta">
          <div><dt>Released</dt><dd>{formatDate(r.releaseDate)}</dd></div>
          <div><dt>Format</dt><dd>{r.format}</dd></div>
          <div><dt>Size</dt><dd>{formatSize(r.fileSizeMB)}</dd></div>
          <div><dt>Licence</dt><dd><a href={r.licence.url} target="_blank" rel="noopener noreferrer">{r.licence.name}</a></dd></div>
          <div><dt>Source</dt><dd>{r.source.url ? <a href={r.source.url} target="_blank" rel="noopener noreferrer">{r.source.name}</a> : r.source.name}</dd></div>
        </dl>
        <a className="btn btn-primary" href={r.downloadUrl} target="_blank" rel="noopener noreferrer">
          Download {r.format}<span className="sr-only"> for {r.title}</span>
        </a>
      </div>
    </article>
  );
}
