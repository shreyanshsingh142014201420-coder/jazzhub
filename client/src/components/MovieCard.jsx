import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Bookmark, BookmarkCheck, Play } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getPosterUrl } from '../utils/imageUrl';

export default function MovieCard({ movie, showTypeBadge = false }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);
  const isTV = movie.media_type === 'tv' || !!movie.first_air_date || (movie.number_of_seasons !== undefined);
  const isAnime = movie.is_anime || (Array.isArray(movie.category) && movie.category.includes('anime'));

  const releaseYear = movie.release_date
    ? movie.release_date.substring(0, 4)
    : (movie.first_air_date ? movie.first_air_date.substring(0, 4) : (movie.year || ''));

  const rating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : (typeof movie.rating === 'number' ? movie.rating.toFixed(1) : 'N/A');

  const posterSrc = getPosterUrl(movie.poster_path || movie.poster);
  const displayTitle = movie.title || movie.name || 'Untitled';

  const handleCardClick = () => {
    if (isTV) {
      navigate(`/tv/${movie.id}`);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isTV) {
      navigate(`/watch/tv/${movie.id}/1/1`);
    } else {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    toggleWatchlist({ ...movie, title: displayTitle, media_type: isTV ? 'tv' : 'movie' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <article
      className="movie-card"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${displayTitle}, rated ${rating} out of 10`}
    >
      {/* 2:3 Poster Frame */}
      <div className="movie-poster-container">
        <img
          src={posterSrc}
          alt={displayTitle}
          className="movie-poster-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = getPosterUrl(null);
          }}
        />

        {/* Top Badges */}
        <div className="card-top-badges">
          {(showTypeBadge || isTV || isAnime) && (
            <span className="card-type-badge">
              {isAnime ? 'Anime' : isTV ? 'TV Series' : 'Movie'}
            </span>
          )}

          <button
            type="button"
            className={`card-watchlist-btn ${inWatchlist ? 'is-active' : ''}`}
            onClick={handleWatchlistClick}
            title={inWatchlist ? 'Remove from My List' : 'Add to My List'}
            aria-label={inWatchlist ? 'Remove from My List' : 'Add to My List'}
          >
            {inWatchlist ? (
              <BookmarkCheck size={16} className="icon-active" />
            ) : (
              <Bookmark size={16} />
            )}
          </button>
        </div>

        {/* Hover Overlay with Play Button and Subtle Gradient */}
        <div className="movie-card-hover-overlay">
          <button
            type="button"
            className="card-hover-play-btn"
            onClick={handlePlayClick}
            aria-label={`Play ${displayTitle}`}
          >
            <Play size={22} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Card Info Below Poster */}
      <div className="movie-card-info">
        <h3 className="movie-card-title" title={displayTitle}>
          {displayTitle}
        </h3>
        <div className="movie-card-meta">
          <div className="card-rating">
            <Star size={13} className="star-icon" fill="#e50914" color="#e50914" />
            <span>{rating}</span>
          </div>
          {releaseYear && (
            <>
              <span className="card-meta-dot">•</span>
              <span className="card-meta-year">{releaseYear}</span>
            </>
          )}
          <span className="card-meta-dot">•</span>
          <span className="card-quality-badge">HD</span>
        </div>
      </div>
    </article>
  );
}
