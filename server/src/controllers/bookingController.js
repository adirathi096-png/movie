import { createBooking, cancelBooking } from '../services/bookingService.js';
import { Booking } from '../models/Booking.js';

export const handleCreateBooking = async (req, res, next) => {
  try {
    const { showtimeId, reservationId, seatIds, paymentMethod } = req.body;
    const userId = req.user._id;

    if (!showtimeId) {
      return res.status(400).json({
        success: false,
        message: 'Showtime ID is required to complete booking.',
      });
    }

    const booking = await createBooking({
      userId,
      showtimeId,
      reservationId,
      seatIds,
      paymentMethod: paymentMethod || 'demo_checkout',
    });

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Enjoy the show.',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('movieId', 'title posterUrl backdropUrl durationMinutes certification genres')
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'name format')
      .populate('showtimeId', 'startTime endTime format status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Booking history retrieved successfully.',
      data: { bookings },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('showtimeId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Ownership check
    const isOwner = booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this booking record.',
      });
    }

    res.json({
      success: true,
      message: 'Booking details retrieved.',
      data: { booking },
    });
  } catch (err) {
    next(err);
  }
};

export const handleCancelBooking = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const { reason } = req.body;

    const result = await cancelBooking({
      bookingId,
      userId,
      isAdmin,
      reason,
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund initiated to original payment method.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
