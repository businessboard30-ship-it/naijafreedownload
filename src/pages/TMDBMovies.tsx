import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useSeo } from '../lib/useSeo';
import DownloadButton from '../components/DownloadButton';

type Movie = { id: number; title: string; overview: string; poster_path: string | null; backdrop_path: string | null; release_date: string; vote_average: number; genre_ids?: number[]; original_language?: string; origin_country?: string[]; runtime?: number; genres?: {id:number;name:string}[] };
type Results = { results: Movie[]; total_pages: number; total_results: number };
const image = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
type Country = { iso_3166_1: string; english_name: string };



const SEASONAL_CATEGORIES = [
  { label: 'Christmas', query: 'Christmas' },
  { label: 'Halloween', query: 'Halloween' },
  { label: 'Valentine’s Day', query: 'Valentine' },
  { label: 'Summer', query: 'Summer holiday' },
  { label: 'Winter', query: 'Winter' },
  { label: 'New Year', query: 'New Year' },
  { label: 'Easter', query: 'Easter' },
];

export function SeasonalMovies() {
  const [category, setCategory] = useState(SEASONAL_CATEGORIES[0]);
  const [data, setData] = useState<Results | null>(null);
  const [error, setError] = useState('');
  useSeo('Seasonal movies', 'Explore movies for Christmas, Halloween, Valentine’s Day, summer, winter, New Year and other seasonal occasions.');
  useEffect(() => {
    const ctrl = new AbortController();
    setData(null);
    setError('');
    fetch('/api/tmdb/search/movie?query=' + encodeURIComponent(category.query) + '&page=1', { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d.error || 'Seasonal movie catalogue unavailable.'))))
      .then(setData)
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); });
    return () => ctrl.abort();
  }, [category]);
  const items = data?.results ?? [];
  return <>
    <PageHeader title="Seasonal movies">Find films for the moment: festive favourites, spooky nights, romantic dates, summer breaks and winter evenings.</PageHeader>
    <nav className="toolbar" aria-label="Seasonal movie categories">
      {SEASONAL_CATEGORIES.map(item => <button key={item.label} className={category.label === item.label ? 'btn btn-primary' : 'btn'} onClick={() => setCategory(item)}>{item.label}</button>)}
    </nav>
    {error && <p className="panel" role="alert">{error}</p>}
    {!data && !error && <p className="muted">Finding {category.label.toLowerCase()} movies…</p>}
    {data && <>
      <p className="muted small">{data.total_results.toLocaleString()} results for {category.label}</p>
      {items.length ? <div className="grid">{items.map(m => <article className="card release" key={m.id}>
        {m.poster_path ? <img className="cover" src={image(m.poster_path)} alt={m.title} loading="lazy" /> : <div className="cover cover-empty">No poster</div>}
        <div className="release-body"><h3><Link to={'/movies/' + m.id}>{m.title}</Link></h3><p className="muted small">{m.release_date?.slice(0,4) || 'Release date unavailable'} · ★ {m.vote_average?.toFixed(1) ?? '—'}</p><p className="desc">{m.overview || 'No synopsis available.'}</p><Link to={'/movies/' + m.id}>View movie details</Link></div>
      </article>)}</div> : <p className="panel">No titles found in this category right now. Try another seasonal collection.</p>}
    </>}
    <p className="muted small">Movie metadata and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
}

export function TMDBMovies() {
  useSeo('Movies worldwide', 'Discover trending, popular and top-rated films from countries and cinema industries around the world.');
  const [tab,setTab] = useState('trending/movie/week');
  const [query,setQuery] = useState('');
  const [country,setCountry] = useState('');
  const [genre,setGenre] = useState('');
  const [genres,setGenres] = useState<{id:number;name:string}[]>([]);
  const [countries,setCountries] = useState<Country[]>([]);
  const [data,setData] = useState<Results | null>(null);
  const [error,setError] = useState('');
  const [page,setPage] = useState(1);
  useEffect(()=>{ fetch('/api/tmdb/genre/movie/list').then(r=>r.ok?r.json():Promise.reject()).then(d=>setGenres(d.genres ?? [])).catch(()=>{}); fetch('/api/tmdb/configuration/countries').then(r=>r.ok?r.json():Promise.reject()).then(d=>setCountries(d ?? [])).catch(()=>{}); },[]);
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
      <div className="field"><label htmlFor="tmdb-country">Country</label><select id="tmdb-country" value={country} onChange={e=>{setCountry(e.target.value);setTab('discover/movie');setPage(1);}}><option value="">All countries</option>{countries.map(c=><option key={c.iso_3166_1} value={c.iso_3166_1}>{c.english_name}</option>)}</select></div>
      <div className="field"><label htmlFor="tmdb-genre">Genre</label><select id="tmdb-genre" value={genre} onChange={e=>{setGenre(e.target.value);setTab('discover/movie');setPage(1);}}><option value="">All genres</option>{genres.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
    </div>
    <nav className="toolbar" aria-label="Movie collections">{[['trending/movie/week','Trending'],['movie/popular','Popular'],['movie/top_rated','Top rated'],['movie/upcoming','Upcoming'],['movie/now_playing','Now playing']].map(([v,l])=><button key={v} className={tab===v?'btn btn-primary':'btn'} onClick={()=>{setTab(v);setQuery('');setCountry('');setGenre('');setPage(1);}}>{l}</button>)}<Link className="btn" to="/anime">Anime</Link></nav>
    {error && <p role="alert" className="panel">{error}</p>}
    {!data && !error && <p className="muted">Loading movies…</p>}
    {data && <><p className="muted small">{data.total_results.toLocaleString()} titles from the worldwide TMDB catalogue</p><div className="grid">{items.map(m=><article className="card release" key={m.id}>{m.poster_path?<img className="cover" src={image(m.poster_path)} alt={m.title} loading="lazy"/>:<div className="cover cover-empty">No poster</div>}<div className="release-body"><h3><Link to={`/movies/${m.id}`}>{m.title}</Link></h3><p className="muted small">{m.release_date?.slice(0,4) || 'Release date unavailable'} · ★ {m.vote_average?.toFixed(1) ?? '—'}</p><p className="desc">{m.overview || 'No synopsis available.'}</p><Link to={`/movies/${m.id}`}>View movie details</Link><div style={{marginTop:12}}><DownloadButton movieId={m.id}/></div></div></article>)}</div><div className="toolbar"><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="muted small">Page {page} of {Math.min(data.total_pages,500)}</span><button className="btn" disabled={page>=data.total_pages || page>=500} onClick={()=>setPage(p=>p+1)}>Next</button></div></>}
    <p className="muted small">Movie metadata and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
}

export function TMDBMovieDetail() {
  const { id } = useParams();
  const [movie,setMovie] = useState<Movie|null>(null);
  const [credits,setCredits] = useState<{cast?:{id:number;name:string;character:string;profile_path:string|null}[];crew?:{job:string;name:string}[]}>({});
  const [error,setError] = useState('');
  useSeo(movie ? `${movie.title} (${movie.release_date?.slice(0,4) || 'Movie'}) — details & download availability` : 'Movie details', movie ? `Explore ${movie.title}, its synopsis, cast, release information and legitimate download availability on NaijaFreeDownload.` : 'Movie information, cast and legitimate download availability from the worldwide movie catalogue.');
  useEffect(()=>{const ctrl=new AbortController();Promise.all([fetch('/api/tmdb/movie/'+id,{signal:ctrl.signal}),fetch('/api/tmdb/movie/'+id+'/credits',{signal:ctrl.signal})]).then(async ([a,b])=>{if(!a.ok||!b.ok)throw new Error('Could not load movie details.');return Promise.all([a.json(),b.json()]);}).then(([m,c])=>{setMovie(m);setCredits(c);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ctrl.abort();},[id]);

  useEffect(() => {
    if (!movie) return;
    const year = movie.release_date?.slice(0,4);
    const title = `${movie.title}${year ? ` (${year})` : ''} — movie details | NaijaFreeDownload`;
    const description = `Find ${movie.title}${year ? ` (${year})` : ''} movie details, synopsis, cast, release information and legal free download availability. Check whether an authorised download is available on NaijaFreeDownload.`.slice(0,300);
    const keywords = [movie.title, `${movie.title} movie`, `${movie.title} free download`, `${movie.title} movie download`, `download ${movie.title}`, `${movie.title} watch online`, `${movie.title} cast`, `${movie.title} ${year || ''}`, 'free movie downloads', 'legal movie downloads', 'worldwide movies'].filter(Boolean).join(', ');
    document.title = title;
    const meta = (selector: string, attr: string, key: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr,key); document.head.appendChild(el); }
      el.content = value;
    };
    meta('meta[name="description"]','name','description',description);
    meta('meta[name="keywords"]','name','keywords',keywords);
    meta('meta[property="og:title"]','property','og:title',title);
    meta('meta[property="og:description"]','property','og:description',description);
    meta('meta[property="og:type"]','property','og:type','video.movie');
    if (movie.poster_path) meta('meta[property="og:image"]','property','og:image',image(movie.poster_path));
    meta('meta[name="twitter:card"]','name','twitter:card','summary_large_image');
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = window.location.origin + window.location.pathname;
    let script = document.head.querySelector<HTMLScriptElement>('#movie-jsonld');
    if (!script) { script = document.createElement('script'); script.id = 'movie-jsonld'; script.type = 'application/ld+json'; document.head.appendChild(script); }
    script.textContent = JSON.stringify({
      '@context':'https://schema.org',
      '@type':'Movie',
      name:movie.title,
      description:movie.overview || description,
      datePublished:movie.release_date || undefined,
      image:movie.poster_path ? image(movie.poster_path) : undefined,
      inLanguage:movie.original_language || undefined,
      genre:movie.genres?.map(g=>g.name),
      url:canonical.href,
      aggregateRating: movie.vote_average > 0 ? {'@type':'AggregateRating',ratingValue:movie.vote_average,bestRating:10} : undefined
    });
    return () => { script?.remove(); };
  },[movie]);

  if(error)return <><PageHeader title="Movie details">{error}</PageHeader><Link to="/movies">Back to movies</Link></>;
  if(!movie)return <p className="muted">Loading movie details…</p>;
  const director=credits.crew?.find(c=>c.job==='Director')?.name;
  return <><PageHeader title={movie.title}>{movie.release_date?.slice(0,4)} · {movie.genres?.map(g=>g.name).join(', ')} · ★ {movie.vote_average?.toFixed(1)}</PageHeader>
    {movie.backdrop_path&&<img src={image(movie.backdrop_path,'w1280')} alt="" style={{width:'100%',borderRadius:12,maxHeight:420,objectFit:'cover'}}/>}
    <section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{movie.poster_path&&<img src={image(movie.poster_path)} alt={movie.title+' poster'} style={{width:190,maxWidth:'40%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>Overview</h2><p>{movie.overview || 'No synopsis available.'}</p><p><strong>Release:</strong> {movie.release_date || 'Unknown'}</p><p><strong>Original language:</strong> {movie.original_language?.toUpperCase() || 'Unknown'}</p><p><strong>Countries:</strong> {movie.origin_country?.join(', ') || 'Not listed'}</p><p><strong>Runtime:</strong> {movie.runtime ? movie.runtime+' minutes' : 'Not listed'}</p><p><strong>Director:</strong> {director || 'Not listed'}</p><h3>Download</h3><DownloadButton movieId={movie.id} detail /><p className="muted small">Files are linked from external hosts such as TeraBox. A download appears only after a verified, authorised file link has been added. TMDB provides movie metadata and artwork, not downloadable movie files.</p></div></section>
    <section><h2>Cast</h2><div className="grid">{(credits.cast??[]).slice(0,12).map(person=><div className="card release" key={person.id}><Link to={'/people/'+person.id} style={{textDecoration:'none'}}>{person.profile_path&&<img className="cover" src={image(person.profile_path,'w342')} alt={person.name} loading="lazy"/>}<div className="release-body"><h3>{person.name}</h3><p className="muted small">Performer · {person.character}</p><span>View performer and filmography</span></div></Link><div className="release-body" style={{paddingTop:0}}><Link to={'/movie-character/'+movie.id+'/'+person.id}>Explore character: {person.character||'Role details'}</Link></div></div>)}</div></section><Link to="/movies">Back to movies</Link><p className="muted small">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
  </>;
}


export function TMDBDocumentaries() {
  useSeo('Documentaries worldwide', 'Discover documentary films from around the world, including nature, history, science, music, culture and true stories.');
  const [data,setData] = useState<Results | null>(null);
  const [page,setPage] = useState(1);
  const [sort,setSort] = useState('popularity.desc');
  const [year,setYear] = useState('');
  const [error,setError] = useState('');
  useEffect(()=>{
    const ctrl = new AbortController();
    const params = new URLSearchParams({page:String(page),with_genres:'99',sort_by:sort});
    if(year) params.set('primary_release_year',year);
    fetch('/api/tmdb/discover/movie?'+params,{signal:ctrl.signal})
      .then(r=>r.ok?r.json():r.json().then(d=>Promise.reject(new Error(d.error || 'Documentary catalogue unavailable.'))))
      .then(d=>{setData(d);setError('');})
      .catch(e=>{if(e.name!=='AbortError')setError(e.message);});
    return ()=>ctrl.abort();
  },[page,sort,year]);
  const items=data?.results ?? [];
  return <>
    <PageHeader title="Documentaries">Explore documentary films from across the world: nature, history, science, music, culture, biography and real-life stories. This is a discovery catalogue; download links are shown only when an authorised file is available.</PageHeader>
    <div className="toolbar" aria-label="Documentary filters">
      <div className="field"><label htmlFor="doc-sort">Order</label><select id="doc-sort" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="popularity.desc">Popular</option><option value="vote_average.desc">Top rated</option><option value="primary_release_date.desc">Recently released</option><option value="revenue.desc">Highest grossing</option></select></div>
      <div className="field"><label htmlFor="doc-year">Release year</label><select id="doc-year" value={year} onChange={e=>{setYear(e.target.value);setPage(1);}}><option value="">All years</option>{Array.from({length:80},(_,i)=>String(new Date().getFullYear()-i)).map(y=><option key={y} value={y}>{y}</option>)}</select></div>
    </div>
    {error&&<p role="alert" className="panel">{error}</p>}
    {!data&&!error&&<p className="muted">Loading documentaries…</p>}
    {data&&<>
      <p className="muted small">{data.total_results.toLocaleString()} documentary films in the worldwide catalogue</p>
      {items.length===0?<p className="panel">No documentaries match these filters. Try another year or sort order.</p>:<div className="grid">{items.map(m=><Link className="card release" key={m.id} to={`/movies/${m.id}`} style={{textDecoration:'none'}}>{m.poster_path?<img className="cover" src={image(m.poster_path)} alt={m.title} loading="lazy"/>:<div className="cover cover-empty">No poster</div>}<div className="release-body"><h3>{m.title}</h3><p className="muted small">{m.release_date?.slice(0,4)||'Release date unavailable'} · ★ {m.vote_average?.toFixed(1)??'—'}</p><p className="desc">{m.overview||'No synopsis available.'}</p><span>View documentary details</span></div></Link>)}</div>}
      <div className="toolbar"><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span className="muted small">Page {page} of {Math.min(data.total_pages,500)}</span><button className="btn" disabled={page>=data.total_pages||page>=500} onClick={()=>setPage(p=>p+1)}>Next</button></div>
    </>}
    <p className="muted small">Documentary metadata and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB. NaijaFreeDownload does not host or link to unauthorised copies.</p>
  </>;
}


type PersonData={id:number;name:string;biography?:string;profile_path:string|null;known_for_department?:string;birthday?:string|null;place_of_birth?:string|null};
type PersonWork={id:number;title?:string;name?:string;character?:string;job?:string;release_date?:string;poster_path:string|null};
type PersonCredits={cast?:PersonWork[];crew?:PersonWork[]};
export function PersonDetail(){
 const {id}=useParams();const [person,setPerson]=useState<PersonData|null>(null);const [credits,setCredits]=useState<PersonCredits>({});const [error,setError]=useState('');
 useSeo(person?person.name+' — actor profile and filmography':'Actor profile',person?'Explore '+person.name+', biography and movies or series.':'Actor and filmmaker profile and filmography.');
 useEffect(()=>{const ctrl=new AbortController();Promise.all([fetch('/api/tmdb/person/'+id,{signal:ctrl.signal}),fetch('/api/tmdb/person/'+id+'/movie_credits',{signal:ctrl.signal})]).then(async ([a,b])=>{if(!a.ok||!b.ok)throw new Error('Profile unavailable.');return Promise.all([a.json(),b.json()]);}).then(([p,c])=>{setPerson(p);setCredits(c);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ctrl.abort();},[id]);
 if(error)return <><PageHeader title="Person profile">{error}</PageHeader><Link to="/movies">Back to movies</Link></>;
 if(!person)return <p className="muted">Loading profile…</p>;
 const works=[...(credits.cast||[]),...(credits.crew||[])].filter((v,i,a)=>a.findIndex(x=>x.id===v.id)===i).sort((a,b)=>(b.release_date||'').localeCompare(a.release_date||''));
 return <><PageHeader title={person.name}>{person.known_for_department||'Film and television'} · {person.birthday||'Birth date not listed'} · {person.place_of_birth||'Place not listed'}</PageHeader><section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{person.profile_path&&<img src={image(person.profile_path)} alt={person.name} style={{width:210,maxWidth:'45%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>Biography</h2><p>{person.biography||'No biography available.'}</p></div></section><section><h2>Movies and appearances</h2><div className="grid">{works.map((w,i)=><Link className="card release" key={w.id+'-'+i} to={'/movies/'+w.id} style={{textDecoration:'none'}}>{w.poster_path&&<img className="cover" src={image(w.poster_path,'w342')} alt="" loading="lazy"/>}<div className="release-body"><h3>{w.title||w.name}</h3><p className="muted small">{w.release_date?.slice(0,4)||'Date unavailable'} · {w.character||w.job||'Appearance'}</p></div></Link>)}</div></section><Link to="/movies">Back to movies</Link><p className="muted small">Person and film metadata provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p></>;
}


type MovieCharacterCast={id:number;name:string;character:string;profile_path:string|null};
type MovieCharacterWork={id:number;title?:string;character?:string;release_date?:string;poster_path:string|null};
export function MovieCharacterDetail(){
 const {movieId,personId}=useParams();
 const [movie,setMovie]=useState<Movie|null>(null);
 const [cast,setCast]=useState<MovieCharacterCast|null>(null);
 const [works,setWorks]=useState<MovieCharacterWork[]>([]);
 const [error,setError]=useState('');
 useSeo(cast?cast.character+' — character profile':'Movie character profile',cast?'Explore '+cast.character+', the performer behind the role, the film it appears in and other screen credits.':'Movie character profile, cast member and related film credits.');
 useEffect(()=>{
  const ctrl=new AbortController();
  Promise.all([
   fetch('/api/tmdb/movie/'+movieId,{signal:ctrl.signal}),
   fetch('/api/tmdb/movie/'+movieId+'/credits',{signal:ctrl.signal}),
   fetch('/api/tmdb/person/'+personId+'/movie_credits',{signal:ctrl.signal})
  ]).then(async ([m,c,p])=>{
   if(!m.ok||!c.ok||!p.ok)throw new Error('Character information is temporarily unavailable.');
   return Promise.all([m.json(),c.json(),p.json()]);
  }).then(([m,c,p])=>{
   setMovie(m);
   const entry=(c.cast||[]).find((v:MovieCharacterCast)=>String(v.id)===String(personId));
   if(!entry)throw new Error('This cast member could not be matched to the selected film.');
   setCast(entry);
   setWorks((p.cast||[]).filter((w:MovieCharacterWork)=>w.id!==Number(movieId)).sort((a:MovieCharacterWork,b:MovieCharacterWork)=>(b.release_date||'').localeCompare(a.release_date||'')));
  }).catch(e=>{if(e.name!=='AbortError')setError(e.message);});
  return()=>ctrl.abort();
 },[movieId,personId]);
 if(error)return <><PageHeader title="Character profile">{error}</PageHeader><Link to="/movies">Back to movies</Link></>;
 if(!movie||!cast)return <p className="muted">Loading character profile…</p>;
 return <>
  <PageHeader title={cast.character||'Movie character'}>Character profile from {movie.title} ({movie.release_date?.slice(0,4)||'year unavailable'}). Explore the film, the performer and other screen credits.</PageHeader>
  <section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>
   {cast.profile_path&&<img src={image(cast.profile_path,'w342')} alt={cast.name} style={{width:190,maxWidth:'42%',height:'fit-content',borderRadius:8}}/>}
   <div style={{flex:'1 1 260px'}}><h2>About this role</h2><p><strong>Character:</strong> {cast.character||'Role not listed'}</p><p><strong>Portrayed by:</strong> <Link to={'/people/'+cast.id}>{cast.name}</Link></p><p><strong>Featured in:</strong> <Link to={'/movies/'+movie.id}>{movie.title}</Link></p><p>{movie.overview||'Film synopsis unavailable.'}</p><p><Link to={'/people/'+cast.id}>View performer biography and complete filmography</Link></p></div>
  </section>
  <section><h2>Other films featuring {cast.name}</h2><p className="muted small">These are the performer’s other screen credits; they are not necessarily appearances by this same character.</p><div className="grid">{works.slice(0,24).map((w,i)=><Link className="card release" key={w.id+'-'+i} to={'/movies/'+w.id} style={{textDecoration:'none'}}>{w.poster_path&&<img className="cover" src={image(w.poster_path,'w342')} alt="" loading="lazy"/>}<div className="release-body"><h3>{w.title||'Untitled film'}</h3><p className="muted small">{w.release_date?.slice(0,4)||'Year unavailable'} · {w.character||'Cast appearance'}</p></div></Link>)}</div></section>
  <Link to={'/movies/'+movie.id}>Back to {movie.title}</Link>
  <p className="muted small">Character, cast and film metadata provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
 </>;
}


type TVShow={id:number;name:string;overview:string;poster_path:string|null;backdrop_path:string|null;first_air_date:string;vote_average:number;original_language?:string;origin_country?:string[];number_of_seasons?:number;number_of_episodes?:number;genres?:{id:number;name:string}[];status?:string};
type TVCredits={cast?:{id:number;name:string;character:string;profile_path:string|null}[];crew?:{job:string;name:string}[]};
export function TMDBTVDetail(){
 const {id}=useParams();const [show,setShow]=useState<TVShow|null>(null);const [credits,setCredits]=useState<TVCredits>({});const [error,setError]=useState('');
 useSeo(show?show.name+' — TV series details':'TV series details',show?'Explore '+show.name+', synopsis, cast, seasons and release information.':'TV series information and cast.');
 useEffect(()=>{const ctrl=new AbortController();Promise.all([fetch('/api/tmdb/tv/'+id,{signal:ctrl.signal}),fetch('/api/tmdb/tv/'+id+'/credits',{signal:ctrl.signal})]).then(async([a,b])=>{if(!a.ok||!b.ok)throw new Error('Could not load TV series details.');return Promise.all([a.json(),b.json()]);}).then(([s,c])=>{setShow(s);setCredits(c);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);});return()=>ctrl.abort();},[id]);
 if(error)return <><PageHeader title="Series details">{error}</PageHeader><Link to="/search">Back to search</Link></>;
 if(!show)return <p className="muted">Loading series details…</p>;
 return <><PageHeader title={show.name}>{show.first_air_date?.slice(0,4)||'Release date unavailable'} · ★ {show.vote_average?.toFixed(1)||'—'} · {show.status||'Status unavailable'}</PageHeader>
 {show.backdrop_path&&<img src={image(show.backdrop_path,'w1280')} alt="" style={{width:'100%',borderRadius:12,maxHeight:420,objectFit:'cover'}}/>}
 <section className="panel prose" style={{display:'flex',gap:24,flexWrap:'wrap'}}>{show.poster_path&&<img src={image(show.poster_path)} alt={show.name+' poster'} style={{width:190,maxWidth:'40%',height:'fit-content',borderRadius:8}}/>}<div style={{flex:'1 1 260px'}}><h2>Overview</h2><p>{show.overview||'No synopsis available.'}</p><p><strong>First aired:</strong> {show.first_air_date||'Unknown'}</p><p><strong>Original language:</strong> {show.original_language?.toUpperCase()||'Unknown'}</p><p><strong>Countries:</strong> {show.origin_country?.join(', ')||'Not listed'}</p><p><strong>Seasons:</strong> {show.number_of_seasons??'Not listed'}</p><p><strong>Episodes:</strong> {show.number_of_episodes??'Not listed'}</p><p><strong>Genres:</strong> {show.genres?.map(g=>g.name).join(', ')||'Not listed'}</p><h3>Availability</h3><p>Sorry, an authorised download is not available yet. We only list downloads when a legitimate source is available.</p></div></section>
 <section><h2>Cast</h2><div className="grid">{(credits.cast||[]).slice(0,18).map(p=><Link className="card release" key={p.id} to={'/people/'+p.id} style={{textDecoration:'none'}}>{p.profile_path&&<img className="cover" src={image(p.profile_path,'w342')} alt={p.name} loading="lazy"/>}<div className="release-body"><h3>{p.name}</h3><p className="muted small">{p.character||'Cast member'}</p><span>View performer profile</span></div></Link>)}</div></section>
 <Link to="/search">Back to search</Link><p className="muted small">TV metadata and images provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</p></>;
}
