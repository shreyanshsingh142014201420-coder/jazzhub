import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Film, Sparkles, Bookmark } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { watchlistCount } = useWatchlist();

  // Hide on watch/cinema mode pages so the player is completely unobstructed
  if (location.pathname.startsWith('/watch')) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <Home size={20} />
        <span className="bottom-nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <Search size={20} />
        <span className="bottom-nav-label">Search</span>
      </NavLink>

      <NavLink
        to="/popular"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <Film size={20} />
        <span className="bottom-nav-label">Movies</span>
      </NavLink>

      <NavLink
        to="/anime"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <Sparkles size={20} />
        <span className="bottom-nav-label">Anime</span>
      </NavLink>

      <NavLink
        to="/watchlist"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'is-active' : ''}`}
      >
        <div className="bottom-nav-icon-wrapper">
          <Bookmark size={20} />
          {watchlistCount > 0 && (
            <span className="bottom-nav-badge">{watchlistCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">My List</span>
      </NavLink>
    </nav>
  );
}
