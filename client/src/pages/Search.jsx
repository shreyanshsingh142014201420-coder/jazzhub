import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Film, AlertTriangle, X } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { searchApi, movieApi } from '../services/api';

const POPULAR_SUGGESTIONS = [
  'Dune', 'Inception', 'Arcane', 'Attack on Titan', 'Shōgun',
  'Stranger Things', 'Demon Slayer', 'Avatar', 'Interstellar', 'The Dark Knight'
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'movie', 'tv', 'anime'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync with URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputVal(q);
    setActiveQuery(q);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      setLoading(true);
      setError(null);

      try {
        let matches = [];
        if (!activeQuery.trim()) {
          matches = await movieApi.getTrending();
        } else {
          matches = await searchApi.search(activeQuery, 'multi');
        }

        if (isMounted) {
          setResults(matches);
          setLoading(false);
        }
      } catch (err) {
        console.error("Search error:", err);
        if (isMounted) {
          setError(err.message || "Error communicating with movie server.");
          setLoading(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [activeQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = inputVal.trim();
    setActiveQuery(trimmed);
    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const handleClear = () => {
    setInputVal('');
    setActiveQuery('');
    setSearchParams({});
  };

  const handleSuggestionClick = (query) => {
    setInputVal(query);
    setActiveQuery(query);
    setSearchParams({ q: query });
  };

  // Grouped / filtered results
  const filteredResults = results.filter(item => {
    if (selectedType === 'all') return true;
    if (selectedType === 'movie') return item.media_type === 'movie';
    if (selectedType === 'tv') return item.media_type === 'tv' && !item.is_anime;
    if (selectedType === 'anime') {
      return item.is_anime || (Array.isArray(item.genre_ids) && item.genre_ids.includes(16) && item.origin_country?.includes('JP'));
    }
    return true;
  });

  return (
    <div className="search-cinematic-page">
      <div className="search-header-container">
        <h1 className="search-headline">Search the Catalog</h1>
        <p className="search-subheadline">
          Discover movies, television series, anime, and blockbusters across TMDB.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="search-cinematic-bar" role="search">
          <SearchIcon size={20} className="search-bar-lens" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search by title, genre, actor, anime..."
            className="search-cinematic-input"
            aria-label="Search titles"
            autoFocus
          />
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="search-clear-action"
              aria-label="Clear search input"
            >
              <X size={18} />
            </button>
          )}
          <button type="submit" className="btn btn-primary search-submit-button">
            Search
          </button>
        </form>

        {/* Quick Filter Tabs */}
        <div className="search-filter-pills-row" role="tablist" aria-label="Media Filters">
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'all'}
            onClick={() => setSelectedType('all')}
            className={`filter-pill-btn ${selectedType === 'all' ? 'is-active' : ''}`}
          >
            All Titles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'movie'}
            onClick={() => setSelectedType('movie')}
            className={`filter-pill-btn ${selectedType === 'movie' ? 'is-active' : ''}`}
          >
            Movies
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'tv'}
            onClick={() => setSelectedType('tv')}
            className={`filter-pill-btn ${selectedType === 'tv' ? 'is-active' : ''}`}
          >
            TV Shows
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedType === 'anime'}
            onClick={() => setSelectedType('anime')}
            className={`filter-pill-btn ${selectedType === 'anime' ? 'is-active' : ''}`}
          >
            Anime
          </button>
        </div>

        {/* Quick Popular Suggestions */}
        <div className="search-suggestions-container">
          <span className="suggestions-label">Popular Searches:</span>
          <div className="suggestions-chips-group">
            {POPULAR_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                className="suggestion-chip"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="search-results-bar">
        <div className="results-summary-text">
          {activeQuery ? (
            <span>
              Showing results for <strong className="query-highlight">"{activeQuery}"</strong> ({filteredResults.length} found)
            </span>
          ) : (
            <span>Recommended Discovery Stream ({filteredResults.length} titles)</span>
          )}
        </div>
      </div>

      {/* Results Display */}
      {loading ? (
        <SkeletonGrid count={12} />
      ) : error ? (
        <div className="empty-state-container">
          <div className="empty-state-icon-wrapper" style={{ color: '#e50914' }}>
            <AlertTriangle size={44} />
          </div>
          <h3 className="empty-state-title">Search Error</h3>
          <p className="empty-state-desc">{error}</p>
          <button type="button" onClick={handleSearchSubmit} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : filteredResults.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No Titles Found"
          description={`We couldn't find any results matching "${activeQuery}". Try adjusting your keywords or browse popular releases.`}
          actionText="Clear Search"
          onActionClick={handleClear}
        />
      ) : (
        <div className="search-posters-grid">
          {filteredResults.map((item) => (
            <MovieCard key={item.id} movie={item} showTypeBadge={true} />
          ))}
        </div>
      )}
    </div>
  );
}
