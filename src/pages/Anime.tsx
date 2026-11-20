import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';

type Anime = { mal_id:number; url:string; title:string; title_english?:string|null; title_japanese?:string|null; synopsis?:string|null; images?:{jpg?:{large_image_url?:string;image_url?:string}}; score?:number|null; year?:number|null; season?:string|null; episodes?:number|null; status?:string; type?:string; genres?:{name:string}[]; aired?:{from?:string|null;string?:string}; studios?:{name:string}[] };
type Payload = { data:Anime[]; pagination?:{last_visible_page:number;has_next_page:boolean} };
const art = (a:Anime) => a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || '';

export default function AnimePage() {
  useSeo('Anime worldwide','Discover currently airing anime, upcoming seasons, popular series and anime films. Search titles and explore new releases.');
  const [tab,setTab]=useState('seasons/now'); const [query,setQuery]=useState(''); const [submitted,setSubmitted]=useState('');
  const [data,setData]=useState<Payload|null>(null); const [page,setPage]=useState(1); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  useEffect(()=>{
    const ctrl=new AbortController(); setLoading(true); setError('');
    const path=submitted?'anime':(tab.startsWith('top/')?'top/anime':tab); const params=new URLSearchParams({page:String(page),limit:'24',sfw:'true'});
    if(submitted) params.set('q',submitted);
    if(tab==='top/popular'&&!submitted){params.set('filter','bypopularity');}
    if(tab==='top/rated'&&!submitted){params.set('order_by','score');params.set('sort','desc');}
    fetch('/api/anime/'+path+'?'+params,{signal:ctrl.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Anime catalogue unavailable.');return d;})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!ctrl.signal.aborted)setLoading(false);});
    return ()=>ctrl.abort();
  },[tab,submitted,page]);
  const tabs=[['seasons/now','New releases'],['seasons/upcoming','Upcoming'],['top/popular','Popular'],['top/rated','Top rated']];
  return <><PageHeader title="Anime">Explore anime from Japan and around the world. Find newly airing seasonal releases, upcoming series, popular titles and anime films.</PageHeader>
    <form className="toolbar" role="search" onSubmit={e=>{e.preventDefault();setSubmitted(query.trim());setPage(1);}}>
      <div className="field grow"><label htmlFor="anime-search">Search anime</label><input id="anime-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search anime titles, series or films"/></div>
      <button className="btn btn-primary" type="submit">Search</button>
      {submitted&&<button className="btn" type="button" onClick={()=>{setSubmitted('');setQuery('');setPage(1);}}>Clear</button>}
    </form>
    {!submitted&&<nav className="toolbar" aria-label="Anime collections">{tabs.map(([v,l])=><button key={v} className={tab===v?'btn btn-primary':'btn'} onClick={()=>{setTab(v);setPage(1);}}>{l}</button>)}</nav>}
    {submitted&&<p className="muted small">Search results for “{submitted}”</p>}
    {loading&&<p className="muted" role="status">Loading anime…</p>}{error&&<p className="panel" role="alert">{error}</p>}
    {data&&!loading&&<><p className="muted small">{data.data?.length||0} titles on this page</p>
      {data.data?.length?<div className="grid">{data.data.map(a=><Link className="card release" key={a.mal_id} to={'/anime/'+a.mal_id} style={{textDecoration:'none'}}>{art(a)?<img className="cover" src={art(a)} alt={a.title} loading="lazy"/>:<div className="cover cover-empty">Anime</div>}<div className="release-body"><h3>{a.title_english||a.title}</h3><p className="muted small">{a.year||a.aired?.from?.slice(0,4)||'Year unavailable'} · {a.type||'Anime'} · ★ {a.score?.toFixed(1)||'—'}</p><p className="desc">{a.synopsis||'Synopsis not available.'}</p><span>View anime details</span></div></Link>)}</div>:<p className="panel">No anime found. Try another title or collection.</p>}
      <div className="toolbar"><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="muted small">Page {page}{data.pagination?.last_visible_page?' of '+data.pagination.last_visible_page:''}</span><button className="btn" disabled={!data.pagination?.has_next_page} onClick={()=>setPage(p=>p+1)}>Next</button></div>
    </>}
    <p className="muted small">Anime metadata and artwork are provided by Jikan, an unofficial MyAnimeList API. NaijaFreeDownload does not host anime episodes or provide unauthorised copies. Direct downloads appear only when properly authorised.</p>
  </>;
}

export function AnimeDetail() {
  const {id}=useParams(); const [anime,setAnime]=useState<Anime|null>(null); const [characters,setCharacters]=useState<any[]>([]); const [error,setError]=useState('');
  useSeo(anime?anime.title+' — anime details':'Anime details',anime?'Explore '+anime.title+', synopsis, season, studios and release information.':'Anime information and release details.');
  useEffect(()=>{const ctrl=new AbortController();fetch('/api/anime/anime/'+id+'/full',{signal:ctrl.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Could not load anime details.');return d.data;}).then(setAnime).catch(e=>{if(e.name!=='AbortError')setError(e.message);});fetch('/api/anime/anime/'+id+'/characters',{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setCharacters(d.data||[])).catch(()=>{});return()=>ctrl.abort();},[id]);
  if(error)return <><PageHeader title="Anime details">{error}</PageHeader><Link to="/anime">Back to anime</Link></>;
  if(!anime)return <p className="muted">Loading anime details…</p>;
  return <><PageHeader title={anime.title_english||anime.title}>{anime.title_japanese||''} · {anime.year||anime.aired?.from?.slice(0,4)||'Year unavailable'} · {anime.type||'Anime'} · ★ {anime.score?.toFixed(1)||'—'}</PageHeader>
    <section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{art(anime)&&<img src={art(anime)} alt={anime.title} style={{width:220,maxWidth:'45%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>Synopsis</h2><p>{anime.synopsis||'Synopsis not available.'}</p><p><strong>Status:</strong> {anime.status||'Not listed'}</p><p><strong>Episodes:</strong> {anime.episodes??'Not announced'}</p><p><strong>Season:</strong> {anime.season||'Not listed'} {anime.year||''}</p><p><strong>Studios:</strong> {anime.studios?.map(s=>s.name).join(', ')||'Not listed'}</p><p><strong>Genres:</strong> {anime.genres?.map(g=>g.name).join(', ')||'Not listed'}</p><p><strong>Release:</strong> {anime.aired?.string||'Not listed'}</p><p><a href={anime.url} target="_blank" rel="noopener noreferrer">View listing on MyAnimeList</a></p><h3>Episode availability</h3><p>Authorised episode downloads are not listed yet.</p></div></section><section><h2>Characters and voice actors</h2>{characters.length?<div className="grid">{characters.slice(0,18).map((entry:any)=><div className="card release" key={entry.character?.mal_id}><Link to={'/anime-character/'+entry.character?.mal_id} style={{textDecoration:'none'}}>{entry.character?.images?.jpg?.image_url&&<img className="cover" src={entry.character.images.jpg.image_url} alt={entry.character.name} loading="lazy"/>}<div className="release-body"><h3>{entry.character?.name}</h3><p className="muted small">{entry.role||'Character'} · View character</p></div></Link>{entry.voice_actors?.slice(0,2).map((v:any)=><p className="muted small" key={v.person?.mal_id}>{v.language}: <Link to={'/anime-character/'+v.person?.mal_id}>{v.person?.name}</Link></p>)}</div>)}</div>:<p className="muted">Character information is not available for this title yet.</p>}</section><Link to="/anime">Back to anime</Link><p className="muted small">Metadata supplied by Jikan, an unofficial MyAnimeList API. Not affiliated with or endorsed by MyAnimeList.</p></>;
}

type AnimeCharacterData={mal_id:number;name:string;name_kanji?:string|null;about?:string|null;images?:{jpg?:{image_url?:string}};anime?:{role:string;anime:{mal_id:number;title:string;images?:{jpg?:{image_url?:string}}}}[];voices?:{language:string;person:{mal_id:number;name:string}}[]};
export function AnimeCharacterDetail(){
 const {id}=useParams();const [character,setCharacter]=useState<AnimeCharacterData|null>(null);const [error,setError]=useState('');
 useSeo(character?character.name+' — anime character':'Anime character',character?'Explore '+character.name+', character profile, anime appearances and voice actors.':'Anime character profile and appearances.');
 useEffect(()=>{const ctrl=new AbortController();fetch('/api/anime/characters/'+id+'/full',{signal:ctrl.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error('Character profile unavailable.');return d.data;}).then(setCharacter).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ctrl.abort();},[id]);
 if(error)return <><PageHeader title="Character profile">{error}</PageHeader><Link to="/anime">Back to anime</Link></>;
 if(!character)return <p className="muted">Loading character…</p>;
 return <><PageHeader title={character.name}>{character.name_kanji||'Anime character'}</PageHeader><section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{character.images?.jpg?.image_url&&<img src={character.images.jpg.image_url} alt={character.name} style={{width:210,maxWidth:'45%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>About</h2><p>{character.about||'No biography available.'}</p></div></section><section><h2>Anime appearances</h2><div className="grid">{(character.anime||[]).map((a,i)=><Link className="card release" key={a.anime.mal_id+'-'+i} to={'/anime/'+a.anime.mal_id} style={{textDecoration:'none'}}>{a.anime.images?.jpg?.image_url&&<img className="cover" src={a.anime.images.jpg.image_url} alt={a.anime.title} loading="lazy"/>}<div className="release-body"><h3>{a.anime.title}</h3><p className="muted small">{a.role}</p></div></Link>)}</div></section><section><h2>Voice actors</h2>{(character.voices||[]).map((v,i)=><p key={i}>{v.language}: {v.person.name}</p>)}</section><Link to="/anime">Back to anime</Link></>;
}
