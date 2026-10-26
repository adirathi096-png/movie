import express from 'express';
import {
  getShowtimes,
  getShowtimeById,
  getShowtimeSeats,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} from '../controllers/showtimeController.js';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);
router.get('/:id/seats', optionalAuth, getShowtimeSeats);

// Admin showtime management
router.post('/', verifyToken, requireAdmin, createShowtime);
router.patch('/:id', verifyToken, requireAdmin, updateShowtime);
router.delete('/:id', verifyToken, requireAdmin, deleteShowtime);

export default router;
