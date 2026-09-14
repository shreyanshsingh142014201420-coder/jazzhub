import React from 'react';
import { Link } from 'react-router-dom';
import jazzhubLogo from '../assets/hero.png';

export default function Footer() {
  return (
    <footer className="cinematic-footer">
      <div className="footer-top-divider"></div>
      <div className="footer-inner-container">
        {/* Brand & Mission */}
        <div className="footer-brand-column">
          <Link to="/" className="navbar-brand">
            <img src={jazzhubLogo} alt="JazzHub" className="brand-logo-img" />
            <span className="brand-name">
              JAZZ<span className="brand-highlight">HUB</span>
            </span>
          </Link>
          <p className="footer-description">
            Your destination for premium cinematic entertainment. Discover, track, and stream the world's most acclaimed motion pictures, series, and anime.
          </p>
        </div>

        {/* Navigation Column: Movies & TV */}
        <div className="footer-links-column">
          <h4 className="footer-column-heading">Browse Catalog</h4>
          <ul className="footer-links-list">
            <li><Link to="/popular">Trending Movies</Link></li>
            <li><Link to="/tv">Top TV Series</Link></li>
            <li><Link to="/anime">Anime Spotlight</Link></li>
            <li><Link to="/top-rated">Critically Acclaimed</Link></li>
            <li><Link to="/upcoming">Premieres & Upcoming</Link></li>
          </ul>
        </div>

        {/* Features & Personalization */}
        <div className="footer-links-column">
          <h4 className="footer-column-heading">My Cinema</h4>
          <ul className="footer-links-list">
            <li><Link to="/watchlist">My Watchlist</Link></li>
            <li><Link to="/search">Instant Search</Link></li>
            <li><Link to="/popular">Box Office</Link></li>
          </ul>
        </div>

        {/* Technical Stack / Platform */}
        <div className="footer-links-column">
          <h4 className="footer-column-heading">Powered By</h4>
          <ul className="footer-links-list">
            <li><span className="footer-meta-item">TMDB v3 Database</span></li>
            <li><span className="footer-meta-item">React 19 & Vite</span></li>
            <li><span className="footer-meta-item">Express API Gateway</span></li>
            <li><span className="footer-meta-item">AWS EC2 Production</span></li>
          </ul>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="footer-sub-bar">
        <div className="footer-sub-inner">
          <p className="footer-copy-text">
            &copy; {new Date().getFullYear()} JazzHub. All rights reserved. Designed for cinema lovers.
          </p>
          <p className="footer-attribution-text">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
