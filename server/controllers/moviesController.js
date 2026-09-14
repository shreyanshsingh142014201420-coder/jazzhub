import { tmdbService } from '../services/tmdbService.js';
import { playbackService } from '../services/playbackService.js';

export const moviesController = {
  // GET /api/movies/trending
  getTrending: async (req, res, next) => {
    try {
      const timeWindow = req.query.time_window || 'week';
      const movies = await tmdbService.getTrending(timeWindow);
      res.json({ success: true, count: movies.length, data: movies });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/popular
  getPopular: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const movies = await tmdbService.getPopular(page);
      res.json({ success: true, count: movies.length, page, data: movies });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/top-rated
  getTopRated: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const movies = await tmdbService.getTopRated(page);
      res.json({ success: true, count: movies.length, page, data: movies });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/upcoming
  getUpcoming: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const movies = await tmdbService.getUpcoming(page);
      res.json({ success: true, count: movies.length, page, data: movies });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/search?query=...
  search: async (req, res, next) => {
    try {
      const query = req.query.query || '';
      const page = parseInt(req.query.page, 10) || 1;
      const type = req.query.type || 'multi'; // multi, movie, tv
      if (!query.trim()) {
        return res.json({ success: true, count: 0, query: '', data: [] });
      }

      let results = [];
      if (type === 'multi') {
        results = await tmdbService.searchMulti(query, page);
      } else {
        results = await tmdbService.searchMovies(query, page);
      }

      res.json({ success: true, count: results.length, query, page, data: results });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/:id/playback - Playback Endpoint
  getPlayback: async (req, res, next) => {
    try {
      const { id } = req.params;
      const playback = await playbackService.getMoviePlayback(id);
      res.json(playback);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const movie = await tmdbService.getMovieDetails(id);
      if (!movie) {
        return res.status(404).json({
          success: false,
          error: 'Movie not found',
          message: `No movie matching ID ${id} was found.`
        });
      }
      res.json({ success: true, data: movie });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/movies/:id/similar
  getSimilar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const movies = await tmdbService.getSimilarMovies(id);
      res.json({ success: true, count: movies.length, data: movies });
    } catch (err) {
      next(err);
    }
  }
};
