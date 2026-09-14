import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Bookmark, Search, Menu, X } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import jazzhubLogo from '../assets/hero.png';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { watchlistCount } = useWatchlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the navbar on watch pages if in cinema mode
  const isWatchPage = location.pathname.startsWith('/watch');

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  // If on watch page, we let the cinema mode handle its own top header
  if (isWatchPage) {
    return null;
  }

  return (
    <header className={`cinematic-navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Left: Mobile Hamburger OR Desktop Brand */}
        <div className="navbar-left-group">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo with provided PNG */}
          <Link to="/" className="navbar-brand" aria-label="JazzHub Home">
            <img src={jazzhubLogo} alt="JazzHub Logo" className="brand-logo-img" />
            <span className="brand-name">
              JAZZ<span className="brand-highlight">HUB</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Hidden on Mobile) */}
        <nav className="navbar-nav-links" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/popular"
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            Movies
          </NavLink>
          <NavLink
            to="/tv"
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            TV Shows
          </NavLink>
          <NavLink
            to="/anime"
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            Anime
          </NavLink>
          <NavLink
            to="/top-rated"
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            Top Rated
          </NavLink>
          <NavLink
            to="/upcoming"
            className={({ isActive }) => `nav-item-link ${isActive ? 'is-active' : ''}`}
          >
            Upcoming
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions-group">
          {/* Desktop Search Expanding Form */}
          <form onSubmit={handleSearchSubmit} className="nav-search-wrapper" role="search">
            <button
              type="button"
              className="nav-search-toggle"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <Search size={19} />
            </button>
            <div className={`nav-search-expandable ${searchOpen ? 'expanded' : ''}`}>
              <input
                type="text"
                placeholder="Search titles, anime, cast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nav-search-input"
                aria-label="Search input"
              />
            </div>
          </form>

          {/* Desktop Watchlist Button */}
          <Link
            to="/watchlist"
            className="nav-watchlist-link desktop-only"
            aria-label={`My List with ${watchlistCount} titles`}
          >
            <Bookmark size={18} />
            <span className="watchlist-link-text">My List</span>
            {watchlistCount > 0 && (
              <span className="watchlist-count-badge">{watchlistCount}</span>
            )}
          </Link>

          {/* Mobile Profile / My List Icon */}
          <Link
            to="/watchlist"
            className="mobile-profile-btn mobile-only"
            aria-label="My Watchlist"
          >
            <Bookmark size={20} />
            {watchlistCount > 0 && (
              <span className="mobile-badge-dot"></span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-brand">
              <img src={jazzhubLogo} alt="JazzHub" className="drawer-logo-img" />
              <span className="brand-name">JAZZ<span className="brand-highlight">HUB</span></span>
            </div>

            <form onSubmit={handleSearchSubmit} className="mobile-drawer-search">
              <Search size={18} className="search-icon-muted" />
              <input
                type="text"
                placeholder="Search movies, TV, anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-input-field"
                autoFocus
              />
            </form>

            <nav className="mobile-drawer-links">
              <NavLink to="/" end className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/popular" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                Movies
              </NavLink>
              <NavLink to="/tv" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                TV Shows
              </NavLink>
              <NavLink to="/anime" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                Anime
              </NavLink>
              <NavLink to="/top-rated" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                Top Rated
              </NavLink>
              <NavLink to="/upcoming" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                Upcoming
              </NavLink>
              <NavLink to="/watchlist" className={({ isActive }) => `mobile-drawer-item ${isActive ? 'is-active' : ''}`}>
                <span>My List</span>
                {watchlistCount > 0 && (
                  <span className="watchlist-count-badge">{watchlistCount}</span>
                )}
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
