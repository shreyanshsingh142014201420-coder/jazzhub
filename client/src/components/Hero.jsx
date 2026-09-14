import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Info, Bookmark, BookmarkCheck, Star } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getBackdropUrl } from '../utils/imageUrl';

export default function Hero({ movie }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);
  const isTV = movie.media_type === 'tv' || !!movie.first_air_date || (movie.number_of_seasons !== undefined);
  const releaseYear = movie.release_date
    ? movie.release_date.substring(0, 4)
    : (movie.first_air_date ? movie.first_air_date.substring(0, 4) : (movie.year || '2026'));

  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : (movie.rating || '8.5');

  const displayTitle = movie.title || movie.name || 'Featured Title';

  const handleWatchNow = () => {
    if (isTV) {
      navigate(`/watch/tv/${movie.id}/1/1`);
    } else {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  const handleWatchlist = () => {
    toggleWatchlist({ ...movie, title: displayTitle, media_type: isTV ? 'tv' : 'movie' });
  };

  return (
    <section className="cinematic-hero-fullscreen" aria-label="Featured Spotlight">
      {/* Edge-to-Edge Backdrop Media Container */}
      <div className="hero-fullscreen-backdrop">
        <img
          src={getBackdropUrl(movie.backdrop_path || movie.backdrop)}
          alt={displayTitle}
          className="hero-backdrop-img-fill"
          loading="eager"
        />
        {/* Layered cinematic vignettes */}
        <div className="hero-gradient-overlay-h"></div>
        <div className="hero-gradient-overlay-v"></div>
        <div className="hero-ambient-glow"></div>
      </div>

      {/* Content Container (Adapts between Desktop Edge & Mobile App Hero) */}
      <div className="hero-content-viewport">
        <div className="hero-spotlight-pill">
          <span className="pulse-spotlight-dot"></span>
          <span>JAZZHUB SPOTLIGHT</span>
        </div>

        <h1 className="hero-display-title">{displayTitle}</h1>

        <div className="hero-metadata-strip">
          <div className="hero-star-pill">
            <Star size={14} fill="#e50914" color="#e50914" />
            <span>{rating}</span>
          </div>
          <span className="meta-dot-divider">•</span>
          <span className="meta-year-bold">{releaseYear}</span>
          <span className="meta-dot-divider">•</span>
          <span className="meta-tag-pill">4K UHD</span>
          <span className="meta-tag-pill">{isTV ? 'SERIES' : 'MOVIE'}</span>
        </div>

        <p className="hero-blurb-text">
          {movie.overview || movie.description || "Stream the latest critically acclaimed cinema with high-fidelity audio on JazzHub."}
        </p>

        {/* Large Touch-Friendly Buttons */}
        <div className="hero-buttons-cluster">
          <button
            type="button"
            onClick={handleWatchNow}
            className="btn-hero-action primary-watch"
            aria-label={`Play ${displayTitle}`}
          >
            <Play size={20} fill="currentColor" />
            <span>Watch Now</span>
          </button>

          <button
            type="button"
            onClick={handleWatchlist}
            className={`btn-hero-action secondary-list ${inWatchlist ? 'is-active' : ''}`}
            aria-label={inWatchlist ? "Remove from My List" : "Add to My List"}
          >
            {inWatchlist ? (
              <>
                <BookmarkCheck size={18} className="icon-crimson" />
                <span>In My List</span>
              </>
            ) : (
              <>
                <Bookmark size={18} />
                <span>+ My List</span>
              </>
            )}
          </button>

          <Link
            to={isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`}
            className="btn-hero-action secondary-info desktop-only"
            aria-label={`More Info on ${displayTitle}`}
          >
            <Info size={18} />
            <span>Details</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
