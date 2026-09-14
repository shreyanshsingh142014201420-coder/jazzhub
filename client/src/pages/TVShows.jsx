import React, { useEffect, useState } from 'react';
import { Tv, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { tvApi } from '../services/api';

export default function TVShows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating-desc');

  useEffect(() => {
    async function fetchTV() {
      try {
        const [popular, topRated] = await Promise.all([
          tvApi.getPopular().catch(() => []),
          tvApi.getTopRated().catch(() => [])
        ]);

        const combined = [...popular];
        topRated.forEach(item => {
          if (!combined.some(c => c.id === item.id)) {
            combined.push(item);
          }
        });

        setShows(combined);
      } catch (err) {
        console.error("Error fetching TV shows:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTV();
  }, []);

  const sortedShows = [...shows].sort((a, b) => {
    const ratingA = a.vote_average || a.rating || 0;
    const ratingB = b.vote_average || b.rating || 0;
    const yearA = (a.first_air_date || a.release_date || '').substring(0, 4) || 0;
    const yearB = (b.first_air_date || b.release_date || '').substring(0, 4) || 0;

    if (sortBy === 'rating-desc') return ratingB - ratingA;
    if (sortBy === 'rating-asc') return ratingA - ratingB;
    if (sortBy === 'year-desc') return yearB - yearA;
    if (sortBy === 'title-asc') return (a.title || a.name || '').localeCompare(b.title || b.name || '');
    return 0;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-info">
          <div className="page-badge">
            <Tv size={15} />
            <span>Television Series</span>
          </div>
          <h1 className="page-title">TV Series & Shows</h1>
          <p className="page-subtitle">
            Binge-worthy drama, sci-fi, comedy, and critically acclaimed multi-season television.
          </p>
        </div>

        <div className="page-controls">
          <div className="select-wrapper">
            <SlidersHorizontal size={15} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
              aria-label="Sort shows by"
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
      ) : sortedShows.length === 0 ? (
        <EmptyState title="No TV series available" />
      ) : (
        <div className="movies-grid">
          {sortedShows.map((show) => (
            <MovieCard key={show.id} movie={{ ...show, media_type: 'tv' }} />
          ))}
        </div>
      )}
    </div>
  );
}
