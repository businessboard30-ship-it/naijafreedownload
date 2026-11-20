import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ReleaseCard from '../components/ReleaseCard';
import { useCatalogue } from '../lib/CatalogueContext';
import { useSeo } from '../lib/useSeo';
type Movie={id:number;title:string;overview:string;poster_path:string|null;release_date:string;vote_average:number};
type TV={id:number;name:string;overview:string;poster_path:string|null;first_air_date:string;vote_average:number};
type Anime={mal_id:number;title:string;title_english?:string|null;synopsis?:string|null;score?:number|null;year?:number|null;images?:{jpg?:{image_url?:string}}};
type AnimeCharacter={mal_id:number;name:string;about?:string|null;images?:{jpg?:{image_url?:string}}};
type Music={trackId?:number;artistId?:number;trackName?:string;artistName?:string;collectionName?:string;artworkUrl100?:string;trackViewUrl?:string;collectionViewUrl?:string;artistViewUrl?:string;};
const poster=(p:string|null)=>p?'https://image.tmdb.org/t/p/w342'+p:'';
export default function GlobalSearch(){
 useSeo('Search worldwide','Search movies, TV series, anime, music, artists, albums and independent releases worldwide.');
 const [params,setParams]=useSearchParams();const q=params.get('q')||'';const [input,setInput]=useState(q);
 const [movies,setMovies]=useState<Movie[]>([]);const [tv,setTv]=useState<TV[]>([]);const [anime,setAnime]=useState<Anime[]>([]);const [characters,setCharacters]=useState<AnimeCharacter[]>([]);const [music,setMusic]=useState<Music[]>([]);const [error,setError]=useState('');
 const {state}=useCatalogue();
 useEffect(()=>{setInput(q);if(!q.trim()){setMovies([]);setTv([]);setAnime([]);setCharacters([]);setMusic([]);return;}const ctrl=new AbortController();setError('');
 const movieReq=fetch('/api/tmdb/search/movie?'+new URLSearchParams({query:q,page:'1'}),{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('Movie search is unavailable.'))).then(d=>setMovies(d.results||[]));
 const tvReq=fetch('/api/tmdb/search/tv?'+new URLSearchParams({query:q,page:'1'}),{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('TV search is unavailable.'))).then(d=>setTv(d.results||[]));
 const animeReq=fetch('/api/anime/anime?'+new URLSearchParams({q,page:'1',limit:'12',sfw:'true'}),{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('Anime search is unavailable.'))).then(d=>setAnime(d.data||[]));
 const characterReq=fetch('/api/anime/characters?'+new URLSearchParams({q,page:'1',limit:'12'}),{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('Character search is unavailable.'))).then(d=>setCharacters(d.data||[]));
 const musicReq=fetch('/api/music?'+new URLSearchParams({term:q,entity:'musicTrack',country:'US',limit:'20'}),{signal:ctrl.signal}).then(r=>r.ok?r.json():Promise.reject(new Error('Music search is unavailable.'))).then(d=>setMusic(d.results||[]));
 Promise.allSettled([movieReq,tvReq,animeReq,characterReq,musicReq]).then(results=>{if(results.every(x=>x.status==='rejected'))setError('Search services are temporarily unavailable. Please try again.');});
 return()=>ctrl.abort();
 },[q]);
 const local=state.status==='ready'?state.releases.filter(r=>(r.title+' '+r.creator+' '+r.description).toLowerCase().includes(q.toLowerCase())).slice(0,20):[];
 return <><PageHeader title="Search">Search worldwide movies, TV series, anime, anime characters, music, artists, albums and independent releases.</PageHeader>
 <form className="toolbar" role="search" onSubmit={e=>{e.preventDefault();setParams(input.trim()?{q:input.trim()}:{});}}><div className="field grow"><label htmlFor="global-q">What are you looking for?</label><input id="global-q" type="search" value={input} onChange={e=>setInput(e.target.value)} placeholder="Try a film, TV series, anime, character, song, artist or actor"/></div><button className="btn btn-primary" type="submit">Search</button></form>
 {!q&&<p className="muted">Enter a search term to find matching movies, TV series, anime, music and releases.</p>}{error&&<p className="panel" role="alert">{error}</p>}
 {q&&<><h2>Movies</h2>{movies.length?<div className="grid">{movies.map(m=><Link className="card release" key={m.id} to={'/movies/'+m.id} style={{textDecoration:'none'}}>{m.poster_path?<img className="cover" src={poster(m.poster_path)} alt="" loading="lazy"/>:<div className="cover cover-empty">Film</div>}<div className="release-body"><h3>{m.title}</h3><p className="muted small">{m.release_date?.slice(0,4)} · ★ {m.vote_average?.toFixed(1)}</p><p className="desc">{m.overview}</p></div></Link>)}</div>:<p className="muted">No movie matches yet.</p>}
 <h2>TV series</h2>{tv.length?<div className="grid">{tv.map(t=><Link className="card release" key={t.id} to={'/tv/'+t.id} style={{textDecoration:'none'}}>{t.poster_path?<img className="cover" src={poster(t.poster_path)} alt="" loading="lazy"/>:<div className="cover cover-empty">Series</div>}<div className="release-body"><h3>{t.name}</h3><p className="muted small">{t.first_air_date?.slice(0,4)} · ★ {t.vote_average?.toFixed(1)}</p><p className="desc">{t.overview}</p><span>View series details</span></div></Link>)}</div>:<p className="muted">No TV series matches yet.</p>}
 <h2>Anime</h2>{anime.length?<div className="grid">{anime.map(a=><Link className="card release" key={a.mal_id} to={'/anime/'+a.mal_id} style={{textDecoration:'none'}}>{a.images?.jpg?.image_url?<img className="cover" src={a.images.jpg.image_url} alt="" loading="lazy"/>:<div className="cover cover-empty">Anime</div>}<div className="release-body"><h3>{a.title_english||a.title}</h3><p className="muted small">{a.year||'Year unavailable'} · ★ {a.score?.toFixed(1)||'—'}</p><p className="desc">{a.synopsis||'Synopsis not available.'}</p></div></Link>)}</div>:<p className="muted">No anime matches yet.</p>}
 <h2>Anime characters</h2>{characters.length?<div className="grid">{characters.map(c=><Link className="card release" key={c.mal_id} to={'/anime-character/'+c.mal_id} style={{textDecoration:'none'}}>{c.images?.jpg?.image_url&&<img className="cover" src={c.images.jpg.image_url} alt={c.name} loading="lazy"/>}<div className="release-body"><h3>{c.name}</h3><p className="desc">{c.about||'Explore this character and their anime appearances.'}</p><span>View character profile</span></div></Link>)}</div>:<p className="muted">No anime characters found for this search.</p>}
 <h2>Music</h2>{music.length?<div className="grid">{music.map((m,i)=><article className="card release" key={m.trackId||i}>{m.artworkUrl100?<img className="cover" src={m.artworkUrl100.replace('100x100','400x400')} alt="" loading="lazy"/>:<div className="cover cover-empty">♪</div>}<div className="release-body"><h3>{m.trackName||m.collectionName||m.artistName}</h3><p>{m.artistName}</p>{(m.trackViewUrl||m.collectionViewUrl||m.artistViewUrl)&&<a href={m.trackViewUrl||m.collectionViewUrl||m.artistViewUrl} target="_blank" rel="noopener noreferrer">Open official music page</a>}</div></article>)}</div>:<p className="muted">No music matches yet.</p>}
 <h2>Independent releases</h2>{local.length?<div className="grid">{local.map(r=><ReleaseCard key={r.id} r={r}/>)}</div>:<p className="muted">No matching approved independent releases.</p>}</>}
 <p className="muted small">Search combines movie and TV metadata, anime listings, music listings and the approved independent catalogue. Download links appear only when an authorised source is available.</p>
 </>;
}