import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePageSeo } from '../lib/useSeo';

type Track = { collectionId?: number; trackId?: number|string; artistId?: number; trackName?: string; artistName?: string; collectionName?: string; artworkUrl100?: string; previewUrl?: string; trackViewUrl?: string; artistViewUrl?: string; collectionViewUrl?: string; primaryGenreName?: string; releaseDate?: string; kind?: string; };
type Result = { resultCount: number; results: Track[] };
const regions = [['GH','Ghana'],['NG','Nigeria'],['US','United States'],['GB','United Kingdom'],['IN','India'],['KR','South Korea'],['JP','Japan'],['BR','Brazil'],['CA','Canada'],['AU','Australia'],['ZA','South Africa'],['FR','France'],['DE','Germany'],['MX','Mexico']];
const choices = [{value:'musicTrack',label:'Songs'},{value:'album',label:'Albums'},{value:'musicArtist',label:'Artists'}];

function detailPath(r: Track, kind: 'song'|'album'|'artist') {
  const id = kind==='song' ? r.trackId : kind==='album' ? (r.collectionId||r.trackId) : r.artistId;
  return id && /^\d+$/.test(String(id)) ? `/music/${kind}/${id}` : undefined;
}

export default function Music() {
  usePageSeo();
  const [term,setTerm] = useState('');
  const [submitted,setSubmitted] = useState('');
  const [entity,setEntity] = useState('musicTrack');
  const [country,setCountry] = useState('GH');
  const [mode,setMode] = useState<'charts'|'search'>('charts');
  const [chart,setChart] = useState<'songs'|'albums'>('songs');
  const [data,setData] = useState<Result|null>(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    const ctrl=new AbortController();
    setLoading(true);setError('');
    const params = mode === 'charts'
      ? new URLSearchParams({chart,country,limit:'50'})
      : new URLSearchParams({term:submitted,entity,country,limit:'30'});
    fetch('/api/music?'+params,{signal:ctrl.signal})
      .then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Music catalogue is unavailable.');return d;})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);})
      .finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
    return ()=>ctrl.abort();
  },[mode,chart,submitted,entity,country]);

  const search=(e:FormEvent)=>{e.preventDefault();if(!term.trim())return;setSubmitted(term.trim());setMode('search');};
  const itemKind: 'song'|'album'|'artist' = mode==='charts' ? (chart==='songs'?'song':'album') : (entity==='musicTrack'?'song':entity==='album'?'album':'artist');
  const openSearch=()=>{setMode('search');setSubmitted(term.trim());};
  return <><PageHeader title="Music">Discover what people are listening to across countries, explore popular songs and albums, or search for a specific artist, track or record.</PageHeader>
    <div className="toolbar">
      <div className="field"><label htmlFor="music-country">Music charts region</label><select id="music-country" value={country} onChange={e=>setCountry(e.target.value)}>{regions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
      <button className={mode==='charts'?'btn btn-primary':'btn'} type="button" onClick={()=>setMode('charts')}>Popular now</button>
      <button className={mode==='search'?'btn btn-primary':'btn'} type="button" onClick={openSearch}>Search music</button>
    </div>
    {mode==='charts' ? <><div className="section-head"><h2>{chart==='songs'?'Popular songs':'Popular albums'} in {regions.find(r=>r[0]===country)?.[1]||country}</h2></div><div className="toolbar" aria-label="Music chart type">{[['songs','Top songs'],['albums','Top albums']].map(([v,l])=><button key={v} className={chart===v?'btn btn-primary':'btn'} onClick={()=>setChart(v as 'songs'|'albums')}>{l}</button>)}</div></> :
      <><form className="toolbar" role="search" onSubmit={search}><div className="field grow"><label htmlFor="music-q">Find music</label><input id="music-q" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Song, artist or album name" /></div><button className="btn btn-primary" type="submit">Search</button></form><div className="toolbar" aria-label="Search type">{choices.map(c=><button key={c.value} className={entity===c.value?'btn btn-primary':'btn'} onClick={()=>setEntity(c.value)}>{c.label}</button>)}</div>{!submitted&&<p className="muted">Enter a name above to search the international music catalogue.</p>}</>}
    {loading&&<p className="muted" role="status">Loading music…</p>}{error&&<p role="alert" className="panel">{error}</p>}
    {data&&!loading&&<><p className="muted small">{data.resultCount.toLocaleString()} {mode==='charts'?'chart entries':'search results'}</p>{data.results.length===0?<p className="panel">No matches found for this region. Try another country or search term.</p>:<div className="grid">{data.results.map((r,i)=><article className="card release" key={r.trackId||r.artistId||i}>{r.artworkUrl100?<img className="cover" src={r.artworkUrl100.replace('100x100','400x400')} alt="" loading="lazy"/>:<div className="cover cover-empty">♪</div>}<div className="release-body"><h3>{r.trackName||r.artistName||r.collectionName}</h3><p>{r.artistName||r.collectionName}</p><p className="muted small">{r.collectionName&&r.trackName?r.collectionName:''} {r.primaryGenreName?'· '+r.primaryGenreName:''}</p>{r.previewUrl&&<audio controls preload="none" src={r.previewUrl} aria-label={'Preview '+(r.trackName||r.artistName)}/>}{detailPath(r,itemKind)&&<p><Link to={detailPath(r,itemKind)!}>Read details</Link></p>}{(r.trackViewUrl||r.collectionViewUrl||r.artistViewUrl)&&<p><a href={r.trackViewUrl||r.collectionViewUrl||r.artistViewUrl} target="_blank" rel="noopener noreferrer">Open official music page</a></p>}</div></article>)}</div>}</>}
    <p className="muted small">Charts, music details and previews are supplied by Apple’s music catalogue. Listening and purchase options depend on the selected region. NaijaFreeDownload only offers direct downloads when the rights holder has authorised them.</p>
  </>;
}
