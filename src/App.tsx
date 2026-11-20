import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { CatalogueProvider } from './lib/CatalogueContext';
import Overview from './pages/Overview';
import CatalogueView from './pages/CatalogueView';
import { TMDBMovies, TMDBMovieDetail, TMDBDocumentaries, PersonDetail, MovieCharacterDetail, TMDBTVDetail } from './pages/TMDBMovies';
import AnimePage, { AnimeDetail, AnimeCharacterDetail } from './pages/Anime';
import Music from './pages/Music';
import GlobalSearch from './pages/GlobalSearch';
import DownloadCatalogue from './pages/DownloadCatalogue';
import { About, Copyright, Creators, NotFound } from './pages/Static';

export default function App() {
  return (
    <CatalogueProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="music" element={<Music />} />
          <Route path="movies" element={<TMDBMovies />} />
          <Route path="downloads" element={<DownloadCatalogue />} />
          <Route path="movies/:id" element={<TMDBMovieDetail />} />
          <Route path="tv/:id" element={<TMDBTVDetail />} />
          <Route path="movie-character/:movieId/:personId" element={<MovieCharacterDetail />} />
          <Route path="anime" element={<AnimePage />} />
          <Route path="anime/:id" element={<AnimeDetail />} />
          <Route path="anime-character/:id" element={<AnimeCharacterDetail />} />
          <Route path="people/:id" element={<PersonDetail />} />
          <Route path="independent" element={<CatalogueView category="independent" title="Independent creators" description="Discover releases published directly by independent artists and filmmakers worldwide." />} />
          <Route path="documentaries" element={<TMDBDocumentaries />} />
          <Route path="latest" element={<CatalogueView title="Latest releases" description="The most recently released titles from around the world, across every category." latest />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="creators" element={<Creators />} />
          <Route path="about" element={<About />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CatalogueProvider>
  );
}
