import express from 'express';
import {
  getCinemas,
  getCinemaById,
  getCinemaScreens,
  createCinema,
  updateCinema,
  deleteCinema,
  createScreen,
  updateScreen,
} from '../controllers/cinemaController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCinemas);
router.get('/:id', getCinemaById);
router.get('/:id/screens', getCinemaScreens);

// Admin-only cinema & screen management
router.post('/', verifyToken, requireAdmin, createCinema);
router.patch('/:id', verifyToken, requireAdmin, updateCinema);
router.delete('/:id', verifyToken, requireAdmin, deleteCinema);

router.post('/:id/screens', verifyToken, requireAdmin, createScreen);
router.patch('/screens/:id', verifyToken, requireAdmin, updateScreen);

export default router;
