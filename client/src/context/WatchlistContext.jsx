import React, { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

const STORAGE_KEY = 'moviehub_watchlist';

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading watchlist from localStorage', err);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (err) {
      console.error('Error saving watchlist to localStorage', err);
    }
  }, [watchlist]);

  const addToWatchlist = (movie) => {
    if (!movie || !movie.id) return;
    setWatchlist(prev => {
      if (prev.some(m => String(m.id) === String(movie.id))) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeFromWatchlist = (movieId) => {
    setWatchlist(prev => prev.filter(m => String(m.id) !== String(movieId)));
  };

  const isInWatchlist = (movieId) => {
    return watchlist.some(m => String(m.id) === String(movieId));
  };

  const toggleWatchlist = (movie) => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const clearWatchlist = () => {
    setWatchlist([]);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        toggleWatchlist,
        clearWatchlist,
        watchlistCount: watchlist.length
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
