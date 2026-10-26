import express from 'express';
import {
  handleCreateBooking,
  getMyBookings,
  getBookingById,
  handleCancelBooking,
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', handleCreateBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', handleCancelBooking);

export default router;
