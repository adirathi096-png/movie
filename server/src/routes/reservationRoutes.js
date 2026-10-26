import express from 'express';
import {
  createReservation,
  getReservation,
  deleteReservation,
} from '../controllers/reservationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', createReservation);
router.get('/:id', getReservation);
router.delete('/:id', deleteReservation);

export default router;
