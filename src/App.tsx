import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { CatalogueProvider } from './lib/CatalogueContext';
import Overview from './pages/Overview';
import CatalogueView from './pages/CatalogueView';
import { TMDBMovies, TMDBMovieDetail, TMDBDocumentaries, PersonDetail, MovieCharacterDetail, TMDBTVDetail, SeasonalMovies } from './pages/TMDBMovies';
import AnimePage, { AnimeDetail, AnimeCharacterDetail } from './pages/Anime';
import Music from './pages/Music';
import NigeriaMovies from './pages/NigeriaMovies';
import MusicDetail from './pages/MusicDetail';
import GlobalSearch from './pages/GlobalSearch';
import DownloadCatalogue from './pages/DownloadCatalogue';
import AdultContent from './pages/AdultContent';
import { About, Contact, Copyright, Creators, NotFound, PrivacyPolicy, Terms } from './pages/Static';

export default function App() {
  return (
    <CatalogueProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="music" element={<Music />} />
          <Route path="music/song/:id" element={<MusicDetail kind="song" />} />
          <Route path="music/album/:id" element={<MusicDetail kind="album" />} />
          <Route path="music/artist/:id" element={<MusicDetail kind="artist" />} />
          <Route path="movies" element={<TMDBMovies />} />
          <Route path="nigeria-movies" element={<NigeriaMovies />} />
          <Route path="seasonal" element={<SeasonalMovies />} />
          <Route path="downloads" element={<DownloadCatalogue />} />
          <Route path="adult" element={<AdultContent />} />
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
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CatalogueProvider>
  );
}
