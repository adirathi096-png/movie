import express from 'express';
import {
  getMovies,
  getMovieById,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
} from '../controllers/movieController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMovies);
router.get('/slug/:slug', getMovieBySlug);
router.get('/:id', getMovieById);

// Admin-only movie management
router.post('/', verifyToken, requireAdmin, createMovie);
router.patch('/:id', verifyToken, requireAdmin, updateMovie);
router.delete('/:id', verifyToken, requireAdmin, deleteMovie);

export default router;
