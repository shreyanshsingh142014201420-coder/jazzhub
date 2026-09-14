import React, { useEffect, useState } from 'react';
import { TrendingUp, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { movieApi } from '../services/api';

export default function Popular() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating-desc');

  useEffect(() => {
    async function fetchPopular() {
      try {
        const data = await movieApi.getPopular();
        setMovies(data);
      } catch (err) {
        console.error('Error fetching popular movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPopular();
  }, []);

  const sortedMovies = [...movies].sort((a, b) => {
    const ratingA = a.vote_average || a.rating || 0;
    const ratingB = b.vote_average || b.rating || 0;
    const yearA = (a.release_date || '').substring(0, 4) || a.year || 0;
    const yearB = (b.release_date || '').substring(0, 4) || b.year || 0;

    if (sortBy === 'rating-desc') return ratingB - ratingA;
    if (sortBy === 'rating-asc') return ratingA - ratingB;
    if (sortBy === 'year-desc') return yearB - yearA;
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-info">
          <div className="page-badge">
            <TrendingUp size={15} />
            <span>Audience Favorites</span>
          </div>
          <h1 className="page-title">Popular Movies</h1>
          <p className="page-subtitle">
            The most watched, talked about, and celebrated cinema worldwide right now on TMDB.
          </p>
        </div>

        <div className="page-controls">
          <div className="select-wrapper">
            <SlidersHorizontal size={15} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
              aria-label="Sort movies by"
            >
              <option value="rating-desc">Highest Rated First</option>
              <option value="rating-asc">Lowest Rated First</option>
              <option value="year-desc">Newest Releases</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <SkeletonGrid count={12} />
      ) : sortedMovies.length === 0 ? (
        <EmptyState title="No popular movies available" />
      ) : (
        <div className="movies-grid">
          {sortedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
