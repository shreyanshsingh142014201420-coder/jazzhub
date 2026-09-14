// MovieHub Service Layer
// Keeps API/data fetching logic decoupled from UI components.
// To connect to TMDB or another API in the future, only this service needs to be updated.

import { movies } from '../data/movies.js';

export const movieService = {
  // Get all movies
  getAllMovies: async () => {
    return Promise.resolve([...movies]);
  },

  // Get the featured hero movie
  getFeaturedMovie: async () => {
    const featured = movies.find(m => m.featured) || movies[0];
    return Promise.resolve(featured);
  },

  // Get trending movies
  getTrendingMovies: async () => {
    const trending = movies.filter(m => m.category.includes('trending'));
    return Promise.resolve(trending);
  },

  // Get popular movies
  getPopularMovies: async () => {
    const popular = movies.filter(m => m.category.includes('popular'));
    return Promise.resolve(popular);
  },

  // Get top rated movies
  getTopRatedMovies: async () => {
    const topRated = [...movies]
      .filter(m => m.category.includes('top-rated') || m.rating >= 8.5)
      .sort((a, b) => b.rating - a.rating);
    return Promise.resolve(topRated);
  },

  // Get upcoming movies
  getUpcomingMovies: async () => {
    const upcoming = movies.filter(m => m.category.includes('upcoming') || m.year >= 2025);
    return Promise.resolve(upcoming);
  },

  // Get movie details by ID
  getMovieById: async (id) => {
    const movie = movies.find(m => String(m.id) === String(id));
    return Promise.resolve(movie || null);
  },

  // Get similar movies based on shared genre
  getSimilarMovies: async (currentMovieId, limit = 6) => {
    const current = movies.find(m => String(m.id) === String(currentMovieId));
    if (!current) return Promise.resolve([]);

    const currentGenres = Array.isArray(current.genre) ? current.genre : [current.genre];

    const similar = movies
      .filter(m => String(m.id) !== String(currentMovieId))
      .map(m => {
        const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
        const shared = genres.filter(g => currentGenres.includes(g)).length;
        return { movie: m, score: shared };
      })
      .sort((a, b) => b.score - a.score || b.movie.rating - a.movie.rating)
      .map(item => item.movie)
      .slice(0, limit);

    return Promise.resolve(similar);
  },

  // Search movies by title or genre
  searchMovies: async (query, genreFilter = 'All') => {
    const q = (query || '').trim().toLowerCase();

    let results = [...movies];

    if (genreFilter && genreFilter !== 'All') {
      results = results.filter(m => {
        const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
        return genres.some(g => g.toLowerCase() === genreFilter.toLowerCase());
      });
    }

    if (q) {
      results = results.filter(m => {
        const titleMatch = m.title.toLowerCase().includes(q);
        const descMatch = m.description.toLowerCase().includes(q);
        const genres = Array.isArray(m.genre) ? m.genre : [m.genre];
        const genreMatch = genres.some(g => g.toLowerCase().includes(q));
        const castMatch = Array.isArray(m.cast) && m.cast.some(c => c.toLowerCase().includes(q));
        return titleMatch || genreMatch || descMatch || castMatch;
      });
    }

    return Promise.resolve(results);
  },

  // Get all unique genres across the catalog
  getAllGenres: async () => {
    const genreSet = new Set();
    movies.forEach(m => {
      if (Array.isArray(m.genre)) {
        m.genre.forEach(g => genreSet.add(g));
      } else if (typeof m.genre === 'string') {
        genreSet.add(m.genre);
      }
    });
    return Promise.resolve(['All', ...Array.from(genreSet).sort()]);
  }
};
