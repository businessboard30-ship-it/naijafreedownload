import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePageSeo } from '../lib/useSeo';

type Movie = { id:number; title:string; overview:string; poster_path:string|null; release_date:string; vote_average:number };
type Result = { results:Movie[]; total_results:number; total_pages:number };
const image=(path:string|null,size='w500')=>path?`https://image.tmdb.org/t/p/${size}${path}`:'';

export default function NigeriaMovies() {
  const [data,setData]=useState<Result|null>(null);
  const [page,setPage]=useState(1);
  const [error,setError]=useState('');
  usePageSeo();
  useEffect(()=>{
    const ctrl=new AbortController();
    setData(null);setError('');
    const params=new URLSearchParams({page:String(page),with_origin_country:'NG',sort_by:'popularity.desc',language:'en'});
    fetch('/api/tmdb/discover/movie?'+params,{signal:ctrl.signal})
      .then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Nigerian movie catalogue is unavailable.');return d;})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    return ()=>ctrl.abort();
  },[page]);
  const movies=data?.results??[];
  return <>
    <PageHeader title="Nigerian movies">Explore Nigerian cinema, including Nollywood titles. Open a film to check its official trailer and streaming options available in Nigeria.</PageHeader>
    <p className="muted small">Showing films identified in TMDB as originating from Nigeria. Some Nigerian productions may not appear if their catalogue metadata is incomplete.</p>
    {error&&<p className="panel" role="alert">{error}</p>}
    {!data&&!error&&<p className="muted">Loading Nigerian movies…</p>}
    {data&&<><p className="muted small">{data.total_results.toLocaleString()} catalogue results</p>
      {movies.length?<div className="grid">{movies.map(m=><article className="card release" key={m.id}>
        {m.poster_path?<img className="cover" src={image(m.poster_path)} alt={m.title+' poster'} loading="lazy"/>:<div className="cover cover-empty">No poster</div>}
        <div className="release-body"><h3><Link to={'/movies/'+m.id}>{m.title}</Link></h3><p className="muted small">{m.release_date?.slice(0,4)||'Year unavailable'} · ★ {m.vote_average?.toFixed(1)??'—'}</p><p className="desc">{m.overview||'Synopsis not available.'}</p><Link to={'/movies/'+m.id}>Trailer & streaming options</Link></div>
      </article>)}</div>:<p className="panel">No Nigerian titles were returned. Try again later.</p>}
      <div className="toolbar"><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="muted small">Page {page} of {Math.min(data.total_pages,500)}</span><button className="btn" disabled={page>=data.total_pages||page>=500} onClick={()=>setPage(p=>p+1)}>Next</button></div>
    </>}
    <p className="muted small">Film details and artwork are supplied by TMDB. Streaming availability is supplied by TMDB watch-provider data and can change by location.</p>
  </>;
}
