import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies = [], viewAllLink, icon: Icon }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -Math.round(window.innerWidth * 0.75) : Math.round(window.innerWidth * 0.75);
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="movie-row-section" aria-label={title}>
      <div className="movie-row-header">
        <div className="row-title-wrapper">
          <span className="row-accent-bar"></span>
          {Icon && <Icon className="row-title-icon" size={20} />}
          <h2 className="movie-row-title">{title}</h2>
          <span className="row-count-tag">{movies.length}</span>
        </div>

        <div className="row-header-actions">
          {viewAllLink && (
            <Link to={viewAllLink} className="row-view-all-link">
              <span>See All</span>
              <ArrowRight size={15} />
            </Link>
          )}

          {/* Desktop scroll navigation arrows */}
          <div className="row-nav-buttons">
            <button
              type="button"
              className="row-nav-btn"
              onClick={() => scroll('left')}
              aria-label={`Scroll left in ${title}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="row-nav-btn"
              onClick={() => scroll('right')}
              aria-label={`Scroll right in ${title}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="movie-row-container" ref={rowRef}>
        <div className="movie-row-track">
          {movies.map((movie) => (
            <div key={movie.id} className="movie-row-item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
