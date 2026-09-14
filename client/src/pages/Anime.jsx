import React, { useEffect, useState } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { tvApi } from '../services/api';

export default function Anime() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('rating-desc');

  useEffect(() => {
    async function fetchAnime() {
      try {
        const data = await tvApi.getAnime();
        setAnimeList(data);
      } catch (err) {
        console.error("Error fetching anime:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnime();
  }, []);

  const sortedAnime = [...animeList].sort((a, b) => {
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
            <Sparkles size={15} />
            <span>Japanese Animation</span>
          </div>
          <h1 className="page-title">Anime Universe</h1>
          <p className="page-subtitle">
            Iconic shonen epics, fantasy adventures, and masterpiece Japanese animation series.
          </p>
        </div>

        <div className="page-controls">
          <div className="select-wrapper">
            <SlidersHorizontal size={15} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="custom-select"
              aria-label="Sort anime by"
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
      ) : sortedAnime.length === 0 ? (
        <EmptyState title="No anime series found" />
      ) : (
        <div className="movies-grid">
          {sortedAnime.map((item) => (
            <MovieCard key={item.id} movie={{ ...item, media_type: 'tv' }} />
          ))}
        </div>
      )}
    </div>
  );
}
