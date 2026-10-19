import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Popular from './pages/Popular';
import TopRated from './pages/TopRated';
import Upcoming from './pages/Upcoming';
import TVShows from './pages/TVShows';
import Anime from './pages/Anime';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import TVDetails from './pages/TVDetails';
import WatchMovie from './pages/WatchMovie';
import WatchTV from './pages/WatchTV';
import Watchlist from './pages/Watchlist';
import NotFound from './pages/NotFound';
import { WatchlistProvider } from './context/WatchlistContext';

import MobileBottomNav from './components/MobileBottomNav';

// Scroll restoration helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <WatchlistProvider>
      <div className="app-layout">
        <ScrollToTop />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVDetails />} />
            <Route path="/watch/movie/:id" element={<WatchMovie />} />
            <Route path="/watch/tv/:id/:season/:episode" element={<WatchTV />} />
            <Route path="/watch/:type/:id" element={<WatchMovie />} />
            <Route path="/watch/:type/:id/:season/:episode" element={<WatchTV />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    </WatchlistProvider>
  );
}
