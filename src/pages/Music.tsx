import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';

type Track = { trackId?: number; artistId?: number; trackName?: string; artistName?: string; collectionName?: string; artworkUrl100?: string; previewUrl?: string; trackViewUrl?: string; artistViewUrl?: string; collectionViewUrl?: string; primaryGenreName?: string; releaseDate?: string; kind?: string; };
type Result = { resultCount: number; results: Track[] };
const choices = [{value:'musicTrack',label:'Songs'},{value:'album',label:'Albums'},{value:'musicArtist',label:'Artists'}];
export default function Music() {
  useSeo('Music worldwide','Discover songs, albums and artists from around the world.');
  const [term,setTerm] = useState('');
  const [submitted,setSubmitted] = useState('');
  const [entity,setEntity] = useState('musicTrack');
  const [country,setCountry] = useState('US');
  const [data,setData] = useState<Result|null>(null);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  useEffect(()=>{ if(!submitted)return; const ctrl=new AbortController(); setLoading(true);setError('');
    fetch('/api/music?'+new URLSearchParams({term:submitted,entity,country,limit:'30'}),{signal:ctrl.signal})
      .then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Music search failed.');return d;})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>setLoading(false));
    return ()=>ctrl.abort();
  },[submitted,entity,country]);
  const search=(e:React.FormEvent)=>{e.preventDefault();setSubmitted(term.trim());};
  return <><PageHeader title="Music">Explore artists, songs and albums from around the world. Search across international music catalogues and open official listening or purchase pages.</PageHeader>
    <form className="toolbar" role="search" onSubmit={search}>
      <div className="field grow"><label htmlFor="music-q">Find music</label><input id="music-q" value={term} onChange={e=>setTerm(e.target.value)} placeholder="Song, artist or album name" /></div>
      <div className="field"><label htmlFor="music-country">Store region</label><select id="music-country" value={country} onChange={e=>setCountry(e.target.value)}>{[['US','United States'],['GB','United Kingdom'],['NG','Nigeria'],['GH','Ghana'],['IN','India'],['KR','South Korea'],['JP','Japan'],['BR','Brazil'],['CA','Canada'],['AU','Australia'],['ZA','South Africa'],['FR','France'],['DE','Germany'],['MX','Mexico']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
      <button className="btn btn-primary" type="submit">Search music</button>
    </form>
    <div className="toolbar" aria-label="Music type">{choices.map(c=><button key={c.value} className={entity===c.value?'btn btn-primary':'btn'} onClick={()=>setEntity(c.value)}>{c.label}</button>)}</div>
    {!submitted&&<p className="muted">Search for any artist, song or album to explore the international catalogue.</p>}
    {loading&&<p className="muted">Searching music…</p>}{error&&<p role="alert" className="panel">{error}</p>}
    {data&& !loading&&<><p className="muted small">{data.resultCount.toLocaleString()} results</p>{data.results.length===0?<p className="panel">No matches found. Try another spelling or search term.</p>:<div className="grid">{data.results.map((r,i)=><article className="card release" key={r.trackId||r.artistId||i}>{r.artworkUrl100?<img className="cover" src={r.artworkUrl100.replace('100x100','400x400')} alt="" loading="lazy"/>:<div className="cover cover-empty">♪</div>}<div className="release-body"><h3>{r.trackName||r.artistName||r.collectionName}</h3><p>{r.artistName||r.collectionName}</p><p className="muted small">{r.collectionName&&r.trackName?r.collectionName:''} {r.primaryGenreName?'· '+r.primaryGenreName:''}</p>{r.previewUrl&&<audio controls preload="none" src={r.previewUrl} aria-label={'Preview '+(r.trackName||r.artistName)}/>}{(r.trackViewUrl||r.collectionViewUrl||r.artistViewUrl)&&<p><a href={r.trackViewUrl||r.collectionViewUrl||r.artistViewUrl} target="_blank" rel="noopener noreferrer">Open official music page</a></p>}</div></article>)}</div>}</>}
    <p className="muted small">Music results and previews are supplied by Apple’s iTunes Search API. Availability, prices and listening options depend on the selected store region.</p>
  </>;
}
