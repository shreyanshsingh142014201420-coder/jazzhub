import { Router } from 'express';
import { tmdbService } from '../services/tmdbService.js';
import { playbackService } from '../services/playbackService.js';

const router = Router();

// GET /api/tv/trending
router.get('/trending', async (req, res, next) => {
  try {
    const timeWindow = req.query.time_window || 'week';
    const shows = await tmdbService.getTrendingTV(timeWindow);
    res.json({ success: true, count: shows.length, data: shows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/popular
router.get('/popular', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const shows = await tmdbService.getPopularTV(page);
    res.json({ success: true, count: shows.length, page, data: shows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/top-rated
router.get('/top-rated', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const shows = await tmdbService.getTopRatedTV(page);
    res.json({ success: true, count: shows.length, page, data: shows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/anime
router.get('/anime', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const shows = await tmdbService.getAnime(page);
    res.json({ success: true, count: shows.length, page, data: shows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/:id/season/:season
router.get('/:id/season/:season', async (req, res, next) => {
  try {
    const { id, season } = req.params;
    const seasonData = await tmdbService.getTVSeasonDetails(id, season);
    if (!seasonData) {
      return res.status(404).json({ success: false, error: 'Season not found' });
    }
    res.json({ success: true, data: seasonData });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/:id/season/:season/episode/:episode
router.get('/:id/season/:season/episode/:episode', async (req, res, next) => {
  try {
    const { id, season, episode } = req.params;
    const episodeData = await tmdbService.getTVEpisodeDetails(id, season, episode);
    if (!episodeData) {
      return res.status(404).json({ success: false, error: 'Episode not found' });
    }
    res.json({ success: true, data: episodeData });
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/:id/:season/:episode/playback - Playback Endpoint
router.get('/:id/:season/:episode/playback', async (req, res, next) => {
  try {
    const { id, season, episode } = req.params;
    const playback = await playbackService.getEpisodePlayback(id, season, episode);
    res.json(playback);
  } catch (err) {
    next(err);
  }
});

// GET /api/tv/:id - Series Details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const details = await tmdbService.getTVDetails(id);
    if (!details) {
      return res.status(404).json({
        success: false,
        error: 'TV Series not found',
        message: `No series found matching ID ${id}`
      });
    }
    res.json({ success: true, data: details });
  } catch (err) {
    next(err);
  }
});

export default router;
