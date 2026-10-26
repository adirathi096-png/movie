import crypto from 'crypto';
import { Booking } from '../models/Booking.js';
import { Showtime } from '../models/Showtime.js';
import { SeatReservation } from '../models/SeatReservation.js';

const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IMV-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

export const createBooking = async ({
  userId,
  showtimeId,
  reservationId,
  seatIds,
  paymentMethod = 'demo_checkout',
}) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('movieId')
    .populate('cinemaId')
    .populate('screenId');

  if (!showtime) {
    const error = new Error('Showtime not found.');
    error.statusCode = 404;
    throw error;
  }

  if (showtime.status !== 'active') {
    const error = new Error('This showtime is no longer active.');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(showtime.startTime) <= new Date()) {
    const error = new Error('Cannot book tickets for past or ongoing showtimes.');
    error.statusCode = 400;
    throw error;
  }

  let finalSeatIds = seatIds;

  // Validate reservation if provided
  if (reservationId) {
    const reservation = await SeatReservation.findOne({
      _id: reservationId,
      userId,
      showtimeId,
    });

    if (!reservation) {
      const error = new Error('Valid seat reservation not found.');
      error.statusCode = 400;
      throw error;
    }

    if (reservation.status !== 'held') {
      const error = new Error(`Reservation is already ${reservation.status}. Please select your seats again.`);
      error.statusCode = 400;
      throw error;
    }

    if (new Date(reservation.expiresAt) <= new Date()) {
      reservation.status = 'expired';
      await reservation.save();
      const error = new Error('Your seat reservation has expired. Please select seats again.');
      error.statusCode = 410;
      throw error;
    }

    finalSeatIds = reservation.seatIds;
  }

  if (!finalSeatIds || finalSeatIds.length === 0) {
    const error = new Error('No seats specified for this booking.');
    error.statusCode = 400;
    throw error;
  }

  // Double check that NO confirmed booking exists for any of these seats
  const existingConfirmed = await Booking.find({
    showtimeId,
    status: 'confirmed',
    'seats.seatId': { $in: finalSeatIds },
  });

  if (existingConfirmed.length > 0) {
    const takenSeats = [];
    existingConfirmed.forEach((b) => {
      b.seats.forEach((s) => {
        if (finalSeatIds.includes(s.seatId)) takenSeats.push(s.seatId);
      });
    });
    const error = new Error(`Seat(s) already booked by another user: ${[...new Set(takenSeats)].join(', ')}`);
    error.statusCode = 409;
    throw error;
  }

  // Screen seat map validation & server-side price calculation
  const screen = showtime.screenId;
  const screenSeatMap = new Map();
  screen.seatLayout.forEach((r) => {
    r.seats.forEach((s) => {
      screenSeatMap.set(s.seatId, {
        seatId: s.seatId,
        row: r.row,
        seatNumber: s.seatNumber,
        category: r.category,
        price: showtime.pricing[r.category] || showtime.pricing.standard,
      });
    });
  });

  const bookedSeats = [];
  let basePrice = 0;

  for (const sId of finalSeatIds) {
    const seatInfo = screenSeatMap.get(sId);
    if (!seatInfo) {
      const error = new Error(`Invalid seat ID: ${sId}`);
      error.statusCode = 400;
      throw error;
    }
    bookedSeats.push({
      seatId: seatInfo.seatId,
      row: seatInfo.row,
      seatNumber: seatInfo.seatNumber,
      category: seatInfo.category,
      price: seatInfo.price,
    });
    basePrice += seatInfo.price;
  }

  const convenienceFee = 30 * bookedSeats.length;
  const taxes = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + convenienceFee + taxes;

  // Generate unique booking reference
  let bookingReference = generateBookingReference();
  let referenceExists = await Booking.findOne({ bookingReference });
  while (referenceExists) {
    bookingReference = generateBookingReference();
    referenceExists = await Booking.findOne({ bookingReference });
  }

  const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const booking = await Booking.create({
    bookingReference,
    userId,
    showtimeId,
    movieId: showtime.movieId._id,
    cinemaId: showtime.cinemaId._id,
    screenId: showtime.screenId._id,
    reservationId: reservationId || null,
    seats: bookedSeats,
    pricing: {
      basePrice,
      convenienceFee,
      taxes,
      totalAmount,
    },
    payment: {
      method: paymentMethod,
      transactionId,
      status: 'paid',
      paidAt: new Date(),
    },
    status: 'confirmed',
  });

  // Mark reservation confirmed if one was used
  if (reservationId) {
    await SeatReservation.findByIdAndUpdate(reservationId, {
      status: 'confirmed',
    });
  }

  const populatedBooking = await Booking.findById(booking._id)
    .populate('movieId', 'title posterUrl backdropUrl durationMinutes certification genres')
    .populate('cinemaId', 'name address city facilities')
    .populate('screenId', 'name format')
    .populate('showtimeId', 'startTime endTime format');

  return populatedBooking;
};

export const cancelBooking = async ({ bookingId, userId, isAdmin = false, reason = 'Customer request' }) => {
  const query = { _id: bookingId };
  if (!isAdmin) {
    query.userId = userId;
  }

  const booking = await Booking.findOne(query).populate('showtimeId');
  if (!booking) {
    const error = new Error('Booking not found or you are not authorized to cancel it.');
    error.statusCode = 404;
    throw error;
  }

  if (booking.status !== 'confirmed') {
    const error = new Error(`This booking cannot be cancelled because its status is '${booking.status}'.`);
    error.statusCode = 400;
    throw error;
  }

  const showtimeTime = new Date(booking.showtimeId.startTime).getTime();
  const nowTime = Date.now();
  const hoursUntilShow = (showtimeTime - nowTime) / (1000 * 60 * 60);

  // Cancellation rule: At least 2 hours before showtime (unless admin override)
  if (!isAdmin && hoursUntilShow < 2) {
    const error = new Error(
      'Bookings can only be cancelled up to 2 hours before showtime according to cinema policy.'
    );
    error.statusCode = 400;
    throw error;
  }

  // Calculate refund: Base price refunded, convenience fee non-refundable
  const refundAmount = Math.max(0, booking.pricing.basePrice + booking.pricing.taxes);

  booking.status = 'cancelled';
  booking.payment.status = 'refunded';
  booking.cancellation = {
    cancelledAt: new Date(),
    reason,
    refundAmount,
  };

  await booking.save();

  // If there was a linked reservation, mark it released
  if (booking.reservationId) {
    await SeatReservation.findByIdAndUpdate(booking.reservationId, {
      status: 'released',
    });
  }

  return {
    bookingReference: booking.bookingReference,
    status: 'cancelled',
    refundAmount,
    cancelledAt: booking.cancellation.cancelledAt,
  };
};
