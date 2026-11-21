import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import AdSlot from '../components/AdSlot';
import ReleaseCard from '../components/ReleaseCard';
import { useCatalogue } from '../lib/CatalogueContext';
import { musicSummary } from '../lib/editorial';
import { useSeo } from '../lib/useSeo';

type Item = { wrapperType?: string; kind?: string; collectionType?: string; trackId?: number; collectionId?: number; artistId?: number; trackName?: string; collectionName?: string; artistName?: string; primaryGenreName?: string; releaseDate?: string; trackCount?: number; trackTimeMillis?: number; artworkUrl100?: string; previewUrl?: string; trackViewUrl?: string; collectionViewUrl?: string; artistViewUrl?: string; artistLinkUrl?: string; country?: string; trackNumber?: number };
type Kind = 'song' | 'album' | 'artist';

export default function MusicDetail({ kind }: { kind: Kind }) {
  const { id } = useParams();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const { state } = useCatalogue();

  useEffect(() => {
    const ctrl = new AbortController();
    setItems(null); setError('');
    const params = new URLSearchParams({ lookup: String(id), country: 'US' });
    if (kind === 'album') params.set('entity', 'song');
    fetch('/api/music?' + params, { signal: ctrl.signal })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Music details are unavailable.'); return d; })
      .then((d: { results: Item[] }) => setItems(d.results))
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); });
    return () => ctrl.abort();
  }, [id, kind]);

  const main = items?.[0];
  const name = main ? (kind === 'song' ? main.trackName : kind === 'album' ? main.collectionName : main.artistName) : undefined;
  const artist = main?.artistName;
  const year = main?.releaseDate ? new Date(main.releaseDate).getUTCFullYear() : undefined;
  const summary = main && name ? musicSummary({ kind, name, artist, album: kind === 'song' ? main.collectionName : undefined, genre: main.primaryGenreName, releaseDate: main.releaseDate, trackCount: main.trackCount, durationMs: main.trackTimeMillis }) : '';
  const official = main ? (kind === 'song' ? main.trackViewUrl : kind === 'album' ? main.collectionViewUrl : main.artistLinkUrl || main.artistViewUrl) : undefined;
  const art = main?.artworkUrl100?.replace('100x100', '600x600');

  const ld = main && name ? (kind === 'song'
    ? { '@context': 'https://schema.org', '@type': 'MusicRecording', name, byArtist: { '@type': 'MusicGroup', name: artist }, inAlbum: main.collectionName ? { '@type': 'MusicAlbum', name: main.collectionName } : undefined, genre: main.primaryGenreName, datePublished: main.releaseDate?.slice(0, 10), image: art, url: official }
    : kind === 'album'
      ? { '@context': 'https://schema.org', '@type': 'MusicAlbum', name, byArtist: { '@type': 'MusicGroup', name: artist }, genre: main.primaryGenreName, datePublished: main.releaseDate?.slice(0, 10), numTracks: main.trackCount, image: art, url: official }
      : { '@context': 'https://schema.org', '@type': 'MusicGroup', name, genre: main.primaryGenreName, url: official }) : undefined;

  useSeo(name ? `${name}${kind !== 'artist' && artist ? ` by ${artist}` : ''}: ${kind} details` : 'Music details',
    summary || 'Artist, genre, release information and official listening pages.',
    { noindex: !main, image: art, jsonLd: ld, ogType: kind === 'artist' ? 'profile' : 'music.song' });

  if (error) return <><PageHeader title="Music details">{error}</PageHeader><Link to="/music">Back to music</Link></>;
  if (!items || !main || !name) return <p className="muted" role="status">Loading music details…</p>;

  const tracks = kind === 'album' ? items.filter((i) => i.wrapperType === 'track') : [];
  const verified = state.status === 'ready'
    ? state.releases.filter((r) => r.category === 'music' && r.title.toLowerCase() === name.toLowerCase() && r.creator.toLowerCase() === (artist ?? '').toLowerCase())
    : [];
  const kindLabel = kind === 'song' ? 'Song' : kind === 'album' ? 'Album' : 'Artist';

  return <>
    <PageHeader title={name}>{[kindLabel, kind !== 'artist' ? artist : undefined, main.primaryGenreName, year].filter(Boolean).join(' · ')}</PageHeader>
    <section className="panel prose" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {art && <img src={art} alt={`Artwork for ${name}`} width={220} height={220} style={{ maxWidth: '40%', height: 'fit-content', borderRadius: 8 }} />}
      <div style={{ flex: '1 1 260px' }}>
        <h2>About this {kind}</h2>
        <p>{summary}</p>
        <dl className="meta">
          <div><dt>Type</dt><dd>{kindLabel}</dd></div>
          {kind !== 'artist' && artist && <div><dt>Artist</dt><dd>{artist}</dd></div>}
          {main.primaryGenreName && <div><dt>Genre</dt><dd>{main.primaryGenreName}</dd></div>}
          {main.releaseDate && <div><dt>Release date (as listed by the store)</dt><dd>{main.releaseDate.slice(0, 10)}</dd></div>}
          {kind === 'song' && main.collectionName && <div><dt>Appears on</dt><dd>{main.collectionName}</dd></div>}
        </dl>
        <h3>Listen officially</h3>
        {main.previewUrl && <audio controls preload="none" src={main.previewUrl} aria-label={`30-second preview of ${name}`} />}
        {official ? <p><a className="btn" href={official} target="_blank" rel="noopener noreferrer">Open the official Apple Music page</a></p> : <p className="muted">No official listening page was returned for this item.</p>}
        <h3>Download availability</h3>
        {verified.length === 0 && <p className="muted">No verified free download is available for this title. Official purchase and streaming options are on the store page above.</p>}
      </div>
    </section>
    {verified.length > 0 && <section aria-label="Verified downloads"><div className="grid">{verified.map((r) => <ReleaseCard key={r.id} r={r} />)}</div></section>}
    {tracks.length > 0 && <section className="panel"><h2>Track list</h2><ol>{tracks.map((t) => <li key={t.trackId}>{t.trackName}</li>)}</ol></section>}
    <AdSlot />
    <p><Link to="/music">Back to music</Link></p>
    <p className="muted small">Music information and previews are supplied by Apple’s public music catalogue. NaijaFreeDownload offers direct downloads only when a reviewer has verified the rights and source.</p>
  </>;
}
