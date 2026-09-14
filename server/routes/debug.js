import { Router } from 'express';
import { playbackService } from '../services/playbackService.js';

const router = Router();

// GET /api/debug/playback/movie/:id
router.get('/playback/movie/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await playbackService.getDebugPlayback('movie', id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/debug/playback/tv/:id/:season/:episode
router.get('/playback/tv/:id/:season/:episode', async (req, res, next) => {
  try {
    const { id, season, episode } = req.params;
    const result = await playbackService.getDebugPlayback('tv', id, season, episode);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
