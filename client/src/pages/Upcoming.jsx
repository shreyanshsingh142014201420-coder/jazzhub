import React, { useEffect, useState } from 'react';
import { CalendarClock, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { movieApi } from '../services/api';

export default function Upcoming() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('year-desc');

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const data = await movieApi.getUpcoming();
        setMovies(data);
      } catch (err) {
        console.error('Error fetching upcoming movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  const sortedMovies = [...movies].sort((a, b) => {
    const ratingA = a.vote_average || a.rating || 0;
    const ratingB = b.vote_average || b.rating || 0;
    const yearA = (a.release_date || '').substring(0, 4) || a.year || 0;
    const yearB = (b.release_date || '').substring(0, 4) || b.year || 0;

    if (sortBy === 'year-desc') return yearB - yearA || ratingB - ratingA;
    if (sortBy === 'rating-desc') return ratingB - ratingA;
    if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-info">
          <div className="page-badge">
            <CalendarClock size={15} />
            <span>Coming Soon</span>
          </div>
          <h1 className="page-title">Upcoming Premieres</h1>
          <p className="page-subtitle">
            Anticipated blockbusters and future releases heading to screens worldwide.
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
              <option value="year-desc">Release Date / Year</option>
              <option value="rating-desc">Highest Anticipation</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <SkeletonGrid count={12} />
      ) : sortedMovies.length === 0 ? (
        <EmptyState title="No upcoming movies listed at this time" />
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
