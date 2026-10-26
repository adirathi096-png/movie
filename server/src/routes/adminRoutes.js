import express from 'express';
import {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
