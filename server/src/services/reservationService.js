import { Showtime } from '../models/Showtime.js';
import { Screen } from '../models/Screen.js';
import { Booking } from '../models/Booking.js';
import { SeatReservation } from '../models/SeatReservation.js';

const HOLD_MINUTES = parseInt(process.env.HOLD_EXPIRY_MINUTES || '8', 10);

/**
 * Computes live seat status for a showtime, taking into account screen layout,
 * confirmed bookings, and active temporary seat reservations.
 */
export const getShowtimeSeatAvailability = async (showtimeId, currentUserId = null) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate('movieId', 'title durationMinutes certification posterUrl')
    .populate('cinemaId', 'name city address facilities')
    .populate('screenId');

  if (!showtime) {
    const error = new Error('Showtime not found');
    error.statusCode = 404;
    throw error;
  }

  const screen = showtime.screenId;
  if (!screen) {
    const error = new Error('Associated cinema screen not found');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();

  // Find all confirmed bookings for this showtime
  const confirmedBookings = await Booking.find({
    showtimeId,
    status: 'confirmed',
  }).select('seats');

  const bookedSeatSet = new Set();
  confirmedBookings.forEach((b) => {
    b.seats.forEach((s) => bookedSeatSet.add(s.seatId));
  });

  // Find all active seat reservations (unexpired held seats)
  const activeReservations = await SeatReservation.find({
    showtimeId,
    status: 'held',
    expiresAt: { $gt: now },
  });

  const heldByOthersSet = new Set();
  const heldByCurrentUserSet = new Set();
  let userActiveReservation = null;

  activeReservations.forEach((res) => {
    const isOwner = currentUserId && res.userId.toString() === currentUserId.toString();
    if (isOwner) {
      userActiveReservation = res;
    }
    res.seatIds.forEach((sId) => {
      if (isOwner) {
        heldByCurrentUserSet.add(sId);
      } else {
        heldByOthersSet.add(sId);
      }
    });
  });

  // Build annotated seat layout with pricing and real-time status
  const layout = screen.seatLayout.map((rowObj) => {
    const category = rowObj.category || 'standard';
    const categoryPrice = showtime.pricing[category] || showtime.pricing.standard;

    const seats = rowObj.seats.map((seat) => {
      let state = 'available';

      if (seat.isBlocked) {
        state = 'blocked';
      } else if (bookedSeatSet.has(seat.seatId)) {
        state = 'booked';
      } else if (heldByCurrentUserSet.has(seat.seatId)) {
        state = 'selected'; // held by this user
      } else if (heldByOthersSet.has(seat.seatId)) {
        state = 'reserved'; // temporarily held by another customer
      }

      return {
        seatId: seat.seatId,
        seatNumber: seat.seatNumber,
        row: rowObj.row,
        category,
        price: categoryPrice,
        isAccessible: seat.isAccessible,
        state,
      };
    });

    return {
      row: rowObj.row,
      category,
      priceMultiplier: rowObj.priceMultiplier,
      basePrice: categoryPrice,
      seats,
    };
  });

  return {
    showtime: {
      id: showtime._id,
      movie: showtime.movieId,
      cinema: showtime.cinemaId,
      screen: {
        id: screen._id,
        name: screen.name,
        format: screen.format,
        totalSeats: screen.totalSeats,
      },
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      format: showtime.format,
      pricing: showtime.pricing,
      status: showtime.status,
    },
    seatLayout: layout,
    summary: {
      totalSeats: screen.totalSeats,
      bookedCount: bookedSeatSet.size,
      heldCount: heldByOthersSet.size + heldByCurrentUserSet.size,
      availableCount: Math.max(0, screen.totalSeats - bookedSeatSet.size - heldByOthersSet.size),
    },
    currentUserReservation: userActiveReservation
      ? {
          id: userActiveReservation._id,
          seatIds: userActiveReservation.seatIds,
          expiresAt: userActiveReservation.expiresAt,
          remainingSeconds: Math.max(0, Math.floor((new Date(userActiveReservation.expiresAt) - now) / 1000)),
        }
      : null,
  };
};

/**
 * Concurrency-safe seat reservation hold creation.
 * Checks for already booked seats and active holds before creating a hold.
 */
export const createSeatReservation = async ({ showtimeId, userId, seatIds }) => {
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    const error = new Error('Please select at least one seat.');
    error.statusCode = 400;
    throw error;
  }

  if (seatIds.length > 10) {
    const error = new Error('You may not reserve more than 10 seats per booking.');
    error.statusCode = 400;
    throw error;
  }

  const showtime = await Showtime.findById(showtimeId).populate('screenId');
  if (!showtime) {
    const error = new Error('Showtime does not exist.');
    error.statusCode = 404;
    throw error;
  }

  if (showtime.status !== 'active') {
    const error = new Error('This showtime is no longer active.');
    error.statusCode = 400;
    throw error;
  }

  if (new Date(showtime.startTime) <= new Date()) {
    const error = new Error('Booking is closed for past or in-progress showtimes.');
    error.statusCode = 400;
    throw error;
  }

  const screen = showtime.screenId;
  const validScreenSeats = new Map();
  screen.seatLayout.forEach((r) => {
    r.seats.forEach((s) => {
      validScreenSeats.set(s.seatId, {
        seatId: s.seatId,
        row: r.row,
        seatNumber: s.seatNumber,
        category: r.category,
        isBlocked: s.isBlocked,
        price: showtime.pricing[r.category] || showtime.pricing.standard,
      });
    });
  });

  // Verify all requested seats exist on this screen and are not blocked
  for (const sId of seatIds) {
    const seatObj = validScreenSeats.get(sId);
    if (!seatObj) {
      const error = new Error(`Seat ${sId} does not exist on screen '${screen.name}'.`);
      error.statusCode = 400;
      throw error;
    }
    if (seatObj.isBlocked) {
      const error = new Error(`Seat ${sId} is unavailable for booking.`);
      error.statusCode = 400;
      throw error;
    }
  }

  const now = new Date();

  // 1. Check if any seat is already booked in a confirmed booking
  const conflictingBookings = await Booking.find({
    showtimeId,
    status: 'confirmed',
    'seats.seatId': { $in: seatIds },
  });

  if (conflictingBookings.length > 0) {
    const conflictingSeats = [];
    conflictingBookings.forEach((b) => {
      b.seats.forEach((s) => {
        if (seatIds.includes(s.seatId)) conflictingSeats.push(s.seatId);
      });
    });
    const error = new Error(`Seats already booked: ${[...new Set(conflictingSeats)].join(', ')}`);
    error.statusCode = 409;
    error.data = { conflictingSeats };
    throw error;
  }

  // 2. Check if any seat is currently held by ANOTHER user in an active reservation
  const conflictingReservations = await SeatReservation.find({
    showtimeId,
    status: 'held',
    userId: { $ne: userId },
    expiresAt: { $gt: now },
    seatIds: { $in: seatIds },
  });

  if (conflictingReservations.length > 0) {
    const heldSeats = [];
    conflictingReservations.forEach((r) => {
      r.seatIds.forEach((sId) => {
        if (seatIds.includes(sId)) heldSeats.push(sId);
      });
    });
    const error = new Error(
      `Seats are temporarily held by another customer: ${[...new Set(heldSeats)].join(', ')}. Please choose other seats.`
    );
    error.statusCode = 409;
    error.data = { conflictingSeats: heldSeats };
    throw error;
  }

  // 3. Release any previous active reservation held by THIS user for this showtime
  await SeatReservation.updateMany(
    {
      showtimeId,
      userId,
      status: 'held',
    },
    {
      $set: { status: 'released' },
    }
  );

  // 4. Create new hold with expiration
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
  const reservation = await SeatReservation.create({
    showtimeId,
    userId,
    seatIds,
    expiresAt,
    status: 'held',
  });

  // Calculate pricing breakdown for convenience
  const selectedSeatDetails = seatIds.map((sId) => validScreenSeats.get(sId));
  const basePrice = selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = 30 * seatIds.length;
  const taxes = Math.round(basePrice * 0.18); // 18% GST
  const totalAmount = basePrice + convenienceFee + taxes;

  return {
    reservationId: reservation._id,
    showtimeId,
    seatIds,
    expiresAt,
    remainingSeconds: HOLD_MINUTES * 60,
    seats: selectedSeatDetails,
    pricing: {
      basePrice,
      convenienceFee,
      taxes,
      totalAmount,
    },
  };
};

/**
 * Release an active hold when customer deselects or cancels.
 */
export const releaseSeatReservation = async (reservationId, userId) => {
  const reservation = await SeatReservation.findOne({
    _id: reservationId,
    userId,
    status: 'held',
  });

  if (reservation) {
    reservation.status = 'released';
    await reservation.save();
    return true;
  }
  return false;
};
