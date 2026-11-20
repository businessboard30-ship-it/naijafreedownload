import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { CatalogueProvider } from './lib/CatalogueContext';
import Overview from './pages/Overview';
import CatalogueView from './pages/CatalogueView';
import { About, Copyright, Creators, NotFound } from './pages/Static';

export default function App() {
  return (
    <CatalogueProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Overview />} />
          <Route path="music" element={<CatalogueView category="music" title="Music" description="Licensed and creator-authorised music, with the licence shown on every release." />} />
          <Route path="movies" element={<CatalogueView category="movie" title="Movies & Nollywood" description="Public-domain and creator-authorised films, including Nollywood releases." />} />
          <Route path="independent" element={<CatalogueView category="independent" title="Independent creators" description="Releases published directly by independent artists and filmmakers." />} />
          <Route path="documentaries" element={<CatalogueView category="documentary" title="Documentaries" description="Documentaries that are public domain or openly licensed." />} />
          <Route path="latest" element={<CatalogueView title="Latest releases" description="The most recently released titles across every category." latest />} />
          <Route path="search" element={<CatalogueView title="Search" description="Search every release by title, creator or description." showSearch showCategory />} />
          <Route path="creators" element={<Creators />} />
          <Route path="about" element={<About />} />
          <Route path="copyright" element={<Copyright />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CatalogueProvider>
  );
}
