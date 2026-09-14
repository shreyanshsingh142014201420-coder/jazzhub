import { Router } from 'express';
import { moviesController } from '../controllers/moviesController.js';

const router = Router();

// Routes definition
router.get('/trending', moviesController.getTrending);
router.get('/popular', moviesController.getPopular);
router.get('/top-rated', moviesController.getTopRated);
router.get('/upcoming', moviesController.getUpcoming);
router.get('/search', moviesController.search);
router.get('/:id/playback', moviesController.getPlayback);
router.get('/:id/similar', moviesController.getSimilar);
router.get('/:id', moviesController.getById);

export default router;
