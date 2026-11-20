import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { CatalogueProvider } from './lib/CatalogueContext';
import Overview from './pages/Overview';
import CatalogueView from './pages/CatalogueView';
import { TMDBMovies, TMDBMovieDetail } from './pages/TMDBMovies';
import { About, Copyright, Creators, NotFound } from './pages/Static';

export default function App() {
  return (
    <CatalogueProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="music" element={<CatalogueView category="music" title="Music" description="Discover music from artists and labels around the world, with rights and download details shown for every release." />} />
          <Route path="movies" element={<TMDBMovies />} />
          <Route path="movies/:id" element={<TMDBMovieDetail />} />
          <Route path="independent" element={<CatalogueView category="independent" title="Independent creators" description="Discover releases published directly by independent artists and filmmakers worldwide." />} />
          <Route path="documentaries" element={<CatalogueView category="documentary" title="Documentaries" description="Explore documentaries from international filmmakers and archives." />} />
          <Route path="latest" element={<CatalogueView title="Latest releases" description="The most recently released titles from around the world, across every category." latest />} />
          <Route path="search" element={<CatalogueView title="Search" description="Search the global catalogue by title, creator or description." showSearch showCategory />} />
          <Route path="creators" element={<Creators />} />
          <Route path="about" element={<About />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CatalogueProvider>
  );
}
