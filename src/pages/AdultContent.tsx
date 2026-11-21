import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePageSeo } from '../lib/useSeo';

type Performer = { name: string; slug: string };
type Tag = { name: string; slug: string };
type Scene = {
  id: number;
  title: string;
  scene_title?: string;
  kind: 'scene' | 'movie' | 'vr';
  release_date?: string;
  duration?: number;
  studio?: { name: string; slug: string } | null;
  performers?: Performer[];
  cover?: string;
  urls?: { official?: string; page?: string };
  tags?: Tag[];
};
type Feed = { data: Scene[]; meta: { total: number; page: number; pages: number } };
const safeHttps = (value?: string) => {
  if (!value) return '';
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; }
  catch { return ''; }
};
const duration = (seconds?: number) => seconds && seconds > 0
  ? `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  : 'Runtime not listed';

export default function AdultContent() {
  usePageSeo({ noindex: true });
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [kind, setKind] = useState<'scene' | 'movie' | 'vr'>('scene');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [feed, setFeed] = useState<Feed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try { setAllowed(sessionStorage.getItem('naijafreedownload-adult-consent-v1') === 'yes'); }
    catch { setAllowed(false); }
  }, []);

  const enter = () => {
    if (!checked) return;
    try { sessionStorage.setItem('naijafreedownload-adult-consent-v1', 'yes'); } catch { /* Session-only fallback */ }
    setAllowed(true);
  };

  useEffect(() => {
    if (!allowed) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ kind, page: String(page), per_page: '24', sort: '-release_date' });
    if (query.trim()) params.set('q', query.trim().slice(0, 100));
    setLoading(true);
    setError('');
    fetch('/api/perverzija/scenes?' + params.toString(), { signal: controller.signal })
      .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message || payload.error || 'The adult catalogue is temporarily unavailable.');
        return payload as Feed;
      })
      .then(payload => setFeed({
        ...payload,
        // Strictly separate full-length movies from individual scenes.
        data: (payload.data || []).filter(item => item.kind === kind),
      }))
      .catch(reason => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [allowed, kind, page, query]);

  if (!allowed) return (
    <>
      <PageHeader title="18+ content">A separate age-restricted area. Adult listings are not mixed into Movies, Nigeria Movies or universal search.</PageHeader>
      <section className="panel prose" aria-labelledby="adult-gate-title">
        <p className="muted small">AGE-RESTRICTED · ADULTS ONLY</p>
        <h2 id="adult-gate-title">Confirm before entering</h2>
        <p>This section is intended only for adults aged 18 or older, or the higher legal age required where you live. It contains adult-oriented titles, artwork and descriptive metadata.</p>
        <p>By continuing, you confirm that viewing this category is lawful where you are. This self-declaration is not formal identity or age verification.</p>
        <label style={{display:'flex',gap:10,alignItems:'flex-start',margin:'20px 0'}}>
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>I confirm that I meet the age requirement and wish to enter the 18+ catalogue.</span>
        </label>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <button className="btn btn-primary" type="button" disabled={!checked} onClick={enter}>Continue</button>
          <Link className="btn" to="/">Leave this section</Link>
        </div>
        <p className="muted small" style={{marginTop:18}}>Confirmation lasts for this browser session only. It does not prove your age. Stronger age assurance and local legal review are required before enabling a public adult-content service.</p>
      </section>
    </>
  );

  const items = feed?.data ?? [];
  return (
    <>
      <PageHeader title="18+ adult catalogue">Discover adult studio releases in a dedicated catalogue. Full movies and shorter scenes are kept in separate collections.</PageHeader>
      <section className="panel prose">
        <p>This section imports catalogue metadata from Perverzija DB: titles, release dates, runtimes, studio names, performers, tags and cover thumbnails. Every listing links back to its source record and, when available, the official studio page.</p>
        <p><strong>Intensity:</strong> this feed does not provide a verified intensity score. Listings are therefore marked “Not rated” rather than assigning an invented Mild, Moderate, High or Explicit level. IMDb offers a licensed Parents Guide dataset with severity levels; connecting it requires a data licence.</p>
        <p><strong>Previews and downloads:</strong> this feed provides metadata and official studio links, not licensed preview-video files or download rights. We will not embed scraped clips or link to unauthorised copies.</p>
      </section>
      <div className="toolbar" role="group" aria-label="Adult catalogue type">
        <button className={kind === 'scene' ? 'btn btn-primary' : 'btn'} onClick={() => { setKind('scene'); setPage(1); }}>Scenes & releases</button>
        <button className={kind === 'movie' ? 'btn btn-primary' : 'btn'} onClick={() => { setKind('movie'); setPage(1); }}>Full movies</button>
        <button className={kind === 'vr' ? 'btn btn-primary' : 'btn'} onClick={() => { setKind('vr'); setPage(1); }}>VR</button>
      </div>
      <div className="toolbar" style={{alignItems:'end'}}>
        <div className="field grow">
          <label htmlFor="adult-search">Search this 18+ collection</label>
          <input id="adult-search" type="search" value={query} placeholder="Search titles, performers or studios…" onChange={event => { setQuery(event.target.value); setPage(1); }} />
        </div>
      </div>
      {error && <p className="panel" role="alert">{error}</p>}
      {loading && <p className="muted" role="status">Importing adult catalogue metadata…</p>}
      {!loading && feed && (items.length ? <>
        <p className="muted small">{feed.meta?.total?.toLocaleString?.() ?? items.length} results · Page {feed.meta?.page ?? page} of {feed.meta?.pages ?? 1}</p>
        <div className="grid">
          {items.map(item => {
            const cover = safeHttps(item.cover);
            const official = safeHttps(item.urls?.official);
            const record = safeHttps(item.urls?.page) || 'https://db.perverzija.com';
            return <article className="card release" key={item.id}>
              {cover ? <img className="cover" src={cover} alt={item.title + ' cover'} loading="lazy" referrerPolicy="no-referrer" /> : <div className="cover cover-empty">Artwork unavailable</div>}
              <div className="release-body">
                <p className="muted small">18+ · {item.kind === 'movie' ? 'Full movie' : item.kind === 'vr' ? 'VR' : 'Scene'} · Intensity: Not rated</p>
                <h3>{item.scene_title || item.title}</h3>
                <p className="muted small">{item.release_date || 'Release date unavailable'} · {duration(item.duration)}</p>
                {item.studio?.name && <p><strong>Studio:</strong> {item.studio.name}</p>}
                {item.performers?.length ? <p><strong>Performers:</strong> {item.performers.map(person => person.name).join(', ')}</p> : null}
                {item.tags?.length ? <p className="desc"><strong>Content tags:</strong> {item.tags.slice(0, 5).map(tag => tag.name).join(' · ')}</p> : null}
                <div className="toolbar">
                  {official && <a href={official} target="_blank" rel="noopener noreferrer">Official studio page</a>}
                  <a href={record} target="_blank" rel="noopener noreferrer">Source record · Perverzija DB</a>
                </div>
              </div>
            </article>;
          })}
        </div>
        <div className="toolbar">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</button>
          <span className="muted small">Page {page} of {feed.meta?.pages ?? 1}</span>
          <button className="btn" disabled={page >= (feed.meta?.pages ?? 1)} onClick={() => setPage(value => value + 1)}>Next</button>
        </div>
      </> : !loading ? <div className="state"><h2>No titles in this collection yet</h2><p>The provider returned no records for this content type or search. Try Scenes & releases, clear your search, or check back later. The other sections remain separate.</p></div> : null)}
      <p className="muted small">Catalogue metadata: <a href="https://db.perverzija.com" target="_blank" rel="noopener noreferrer">Perverzija DB</a>. Metadata is provided as-is. Titles, images and trademarks belong to their respective owners. NaijaFreeDownload does not host adult videos or provide unauthorised copies.</p>
    </>
  );
}
