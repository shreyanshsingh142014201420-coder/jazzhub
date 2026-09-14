import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import EmptyState from '../components/EmptyState';
import { useWatchlist } from '../context/WatchlistContext';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  return (
    <div className="page-container watchlist-page">
      <header className="page-header">
        <div className="page-header-info">
          <div className="page-badge">
            <Bookmark size={16} />
            <span>Saved Queue</span>
          </div>
          <h1 className="page-title">My Watchlist</h1>
          <p className="page-subtitle">
            Your personally curated collection of movies ready to stream and discover.
          </p>
        </div>

        {watchlist.length > 0 && (
          <div className="page-controls">
            <button
              type="button"
              onClick={clearWatchlist}
              className="btn btn-outline-danger"
              aria-label="Clear all saved movies from watchlist"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </header>

      {watchlist.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your watchlist is empty"
          description="You haven't added any movies to your watchlist yet. Browse trending movies and tap 'Add to Watchlist' to save them for later."
          actionText="Discover Movies"
          actionLink="/popular"
        />
      ) : (
        <>
          <div className="watchlist-count-bar">
            <span>{watchlist.length} {watchlist.length === 1 ? 'film' : 'films'} saved</span>
          </div>
          <div className="movies-grid">
            {watchlist.map((movie) => (
              <div key={movie.id} className="watchlist-item-wrapper">
                <MovieCard movie={movie} />
                <button
                  type="button"
                  className="watchlist-remove-card-btn"
                  onClick={() => removeFromWatchlist(movie.id)}
                  title="Remove from watchlist"
                  aria-label={`Remove ${movie.title} from watchlist`}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
