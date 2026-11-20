import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';

type Movie = { id: number; title: string; overview: string; poster_path: string | null; backdrop_path: string | null; release_date: string; vote_average: number; genre_ids?: number[]; original_language?: string; origin_country?: string[]; runtime?: number; genres?: {id:number;name:string}[] };
type Results = { results: Movie[]; total_pages: number; total_results: number };
const image = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
const countries = ['US','GB','NG','GH','IN','KR','JP','CN','FR','DE','IT','ES','BR','MX','ZA','EG','TR','AU','CA','NZ','PH','TH','ID','PK','BD','KE','UG','TZ'];
const countryNames: Record<string,string> = { US:'United States',GB:'United Kingdom',NG:'Nigeria',GH:'Ghana',IN:'India',KR:'South Korea',JP:'Japan',CN:'China',FR:'France',DE:'Germany',IT:'Italy',ES:'Spain',BR:'Brazil',MX:'Mexico',ZA:'South Africa',EG:'Egypt',TR:'Türkiye',AU:'Australia',CA:'Canada',NZ:'New Zealand',PH:'Philippines',TH:'Thailand',ID:'Indonesia',PK:'Pakistan',BD:'Bangladesh',KE:'Kenya',UG:'Uganda',TZ:'Tanzania' };

export function TMDBMovies() {
  useSeo('Movies worldwide', 'Discover trending, popular and top-rated films from countries and cinema industries around the world.');
  const [tab,setTab] = useState('trending/movie/week');
  const [query,setQuery] = useState('');
  const [country,setCountry] = useState('');
  const [genre,setGenre] = useState('');
  const [genres,setGenres] = useState<{id:number;name:string}[]>([]);
  const [data,setData] = useState<Results | null>(null);
  const [error,setError] = useState('');
  const [page,setPage] = useState(1);
  useEffect(()=>{ fetch('/api/tmdb/genre/movie/list').then(r=>r.ok?r.json():Promise.reject()).then(d=>setGenres(d.genres ?? [])).catch(()=>{}); },[]);
  useEffect(()=>{
    const ctrl = new AbortController();
    const path = query.trim() ? 'search/movie' : tab;
    const params = new URLSearchParams({page:String(page)});
    if(query.trim()) params.set('query',query.trim());
    if(country || genre || (!query.trim() && tab==='discover/movie')) {
      const p = new URLSearchParams({page:String(page),sort_by:'popularity.desc'});
      if(country) p.set('with_origin_country',country);
      if(genre) p.set('with_genres',genre);
      fetch('/api/tmdb/discover/movie?'+p,{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('Movie catalogue unavailable. Check the TMDB secret in Cloudflare.'))).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    } else {
      fetch('/api/tmdb/'+path+'?'+params,{signal:ctrl.signal}).then(r=>r.ok?r.json():r.json().then((d)=>Promise.reject(new Error(d.error || 'Movie catalogue unavailable.')))).then(setData).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    }
    return ()=>ctrl.abort();
  },[tab,query,country,genre,page]);
  const items = data?.results ?? [];
  return <><PageHeader title="Movies">Discover cinema from every country, language and culture. Explore global trends, search titles, or filter by country and genre.</PageHeader>
    <div className="toolbar" aria-label="Movie discovery filters">
      <div className="field grow"><label htmlFor="tmdb-search">Search movies worldwide</label><input id="tmdb-search" type="search" placeholder="Search any movie..." value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} /></div>
      <div className="field"><label htmlFor="tmdb-country">Country</label><select id="tmdb-country" value={country} onChange={e=>{setCountry(e.target.value);setTab('discover/movie');setPage(1);}}><option value="">All countries</option>{countries.map(c=><option key={c} value={c}>{countryNames[c]}</option>)}</select></div>
      <div className="field"><label htmlFor="tmdb-genre">Genre</label><select id="tmdb-genre" value={genre} onChange={e=>{setGenre(e.target.value);setTab('discover/movie');setPage(1);}}><option value="">All genres</option>{genres.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
    </div>
    <nav className="toolbar" aria-label="Movie collections">{[['trending/movie/week','Trending'],['movie/popular','Popular'],['movie/top_rated','Top rated'],['movie/upcoming','Upcoming'],['movie/now_playing','Now playing']].map(([v,l])=><button key={v} className={tab===v?'btn btn-primary':'btn'} onClick={()=>{setTab(v);setQuery('');setCountry('');setGenre('');setPage(1);}}>{l}</button>)}</nav>
    {error && <p role="alert" className="panel">{error}</p>}
    {!data && !error && <p className="muted">Loading movies…</p>}
    {data && <><p className="muted small">{data.total_results.toLocaleString()} titles from the worldwide TMDB catalogue</p><div className="grid">{items.map(m=><Link className="card release" key={m.id} to={`/movies/${m.id}`} style={{textDecoration:'none'}}>{m.poster_path?<img className="cover" src={image(m.poster_path)} alt={m.title} loading="lazy"/>:<div className="cover cover-empty">No poster</div>}<div className="release-body"><h3>{m.title}</h3><p className="muted small">{m.release_date?.slice(0,4) || 'Release date unavailable'} · ★ {m.vote_average?.toFixed(1) ?? '—'}</p><p className="desc">{m.overview || 'No synopsis available.'}</p><span>View movie details</span></div></Link>)}</div><div className="toolbar"><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="muted small">Page {page} of {Math.min(data.total_pages,500)}</span><button className="btn" disabled={page>=data.total_pages || page>=500} onClick={()=>setPage(p=>p+1)}>Next</button></div></>}
    <p className="muted small">Movie metadata and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
}

export function TMDBMovieDetail() {
  const { id } = useParams();
  const [movie,setMovie] = useState<Movie|null>(null);
  const [credits,setCredits] = useState<{cast?:{id:number;name:string;character:string;profile_path:string|null}[];crew?:{job:string;name:string}[]}>({});
  const [error,setError] = useState('');
  useSeo('Movie details','Movie information and cast from the worldwide TMDB catalogue.');
  useEffect(()=>{const ctrl=new AbortController();Promise.all([fetch('/api/tmdb/movie/'+id,{signal:ctrl.signal}),fetch('/api/tmdb/movie/'+id+'/credits',{signal:ctrl.signal})]).then(async ([a,b])=>{if(!a.ok||!b.ok)throw new Error('Could not load movie details.');return Promise.all([a.json(),b.json()]);}).then(([m,c])=>{setMovie(m);setCredits(c);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ctrl.abort();},[id]);
  if(error)return <><PageHeader title="Movie details">{error}</PageHeader><Link to="/movies">Back to movies</Link></>;
  if(!movie)return <p className="muted">Loading movie details…</p>;
  const director=credits.crew?.find(c=>c.job==='Director')?.name;
  return <><PageHeader title={movie.title}>{movie.release_date?.slice(0,4)} · {movie.genres?.map(g=>g.name).join(', ')} · ★ {movie.vote_average?.toFixed(1)}</PageHeader>
    {movie.backdrop_path&&<img src={image(movie.backdrop_path,'w1280')} alt="" style={{width:'100%',borderRadius:12,maxHeight:420,objectFit:'cover'}}/>}
    <section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{movie.poster_path&&<img src={image(movie.poster_path)} alt={movie.title+' poster'} style={{width:190,maxWidth:'40%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>Overview</h2><p>{movie.overview || 'No synopsis available.'}</p><p><strong>Release:</strong> {movie.release_date || 'Unknown'}</p><p><strong>Original language:</strong> {movie.original_language?.toUpperCase() || 'Unknown'}</p><p><strong>Countries:</strong> {movie.origin_country?.join(', ') || 'Not listed'}</p><p><strong>Runtime:</strong> {movie.runtime ? movie.runtime+' minutes' : 'Not listed'}</p><p><strong>Director:</strong> {director || 'Not listed'}</p><h3>Download availability</h3><p>Sorry, file not available yet.</p><p className="muted small">TMDB provides metadata and artwork, not movie download files. File size and quality will only be displayed when an authorised download is added.</p></div></section>
    <section><h2>Cast</h2><div className="grid">{(credits.cast??[]).slice(0,12).map(person=><article className="card release" key={person.id}>{person.profile_path&&<img className="cover" src={image(person.profile_path,'w342')} alt={person.name} loading="lazy"/>}<div className="release-body"><h3>{person.name}</h3><p className="muted small">{person.character}</p></div></article>)}</div></section><Link to="/movies">Back to movies</Link><p className="muted small">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
}
