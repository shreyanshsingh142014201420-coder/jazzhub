import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit, onClear, placeholder = "Search by movie title, genre, cast..." }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit();
  };

  return (
    <form className="search-bar-form" onSubmit={handleSubmit} role="search">
      <div className="search-bar-input-wrapper">
        <Search className="search-bar-icon" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="search-bar-input"
          aria-label="Search movies"
        />
        {value && (
          <button
            type="button"
            className="search-bar-clear-btn"
            onClick={onClear}
            aria-label="Clear search input"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <button type="submit" className="search-bar-btn">
        <span>Search</span>
      </button>
    </form>
  );
}
