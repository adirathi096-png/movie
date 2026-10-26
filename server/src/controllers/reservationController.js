import { createSeatReservation, releaseSeatReservation } from '../services/reservationService.js';
import { SeatReservation } from '../models/SeatReservation.js';

export const createReservation = async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const userId = req.user._id;

    if (!showtimeId || !seatIds) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID and seat selection array are required.',
      });
    }

    const reservationData = await createSeatReservation({
      showtimeId,
      userId,
      seatIds,
    });

    res.status(201).json({
      success: true,
      message: 'Seats held successfully for checkout.',
      data: reservationData,
    });
  } catch (err) {
    next(err);
  }
};

export const getReservation = async (req, res, next) => {
  try {
    const reservation = await SeatReservation.findById(req.params.id)
      .populate('showtimeId')
      .populate('userId', 'name email');

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.',
      });
    }

    // Ownership check
    if (reservation.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((new Date(reservation.expiresAt) - new Date()) / 1000));

    res.json({
      success: true,
      message: 'Reservation details retrieved.',
      data: {
        reservation,
        remainingSeconds,
        isExpired: remainingSeconds <= 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteReservation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const released = await releaseSeatReservation(req.params.id, userId);

    res.json({
      success: true,
      message: released ? 'Seat hold released.' : 'Reservation already expired or not found.',
    });
  } catch (err) {
    next(err);
  }
};
