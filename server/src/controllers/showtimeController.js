import { Showtime } from '../models/Showtime.js';
import { getShowtimeSeatAvailability } from '../services/reservationService.js';

export const getShowtimes = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, date, format } = req.query;
    const query = { status: 'active' };

    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (screenId) query.screenId = screenId;
    if (format) query.format = format;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // Default: future showtimes from start of today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      query.startTime = { $gte: startOfToday };
    }

    const showtimes = await Showtime.find(query)
      .populate('movieId', 'title posterUrl durationMinutes certification genres')
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'name format totalSeats')
      .sort({ startTime: 1 });

    res.json({
      success: true,
      message: 'Showtimes retrieved successfully.',
      data: { showtimes },
    });
  } catch (err) {
    next(err);
  }
};

export const getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    res.json({
      success: true,
      message: 'Showtime details retrieved.',
      data: { showtime },
    });
  } catch (err) {
    next(err);
  }
};

export const getShowtimeSeats = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const availabilityData = await getShowtimeSeatAvailability(req.params.id, currentUserId);

    res.json({
      success: true,
      message: 'Live seat availability retrieved.',
      data: availabilityData,
    });
  } catch (err) {
    next(err);
  }
};

export const createShowtime = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, startTime, endTime, format, pricing } = req.body;

    // Check for scheduling collision on the same screen
    const collision = await Showtime.findOne({
      screenId,
      status: 'active',
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
        },
      ],
    });

    if (collision) {
      return res.status(409).json({
        success: false,
        message: 'Screen scheduling conflict! Another showtime is already scheduled at this time.',
      });
    }

    const showtime = await Showtime.create({
      movieId,
      cinemaId,
      screenId,
      startTime,
      endTime,
      format: format || '2D',
      pricing: pricing || { standard: 250, premium: 350, vip: 500 },
      status: 'active',
    });

    const populatedShowtime = await Showtime.findById(showtime._id)
      .populate('movieId', 'title')
      .populate('cinemaId', 'name')
      .populate('screenId', 'name');

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully.',
      data: { showtime: populatedShowtime },
    });
  } catch (err) {
    next(err);
  }
};

export const updateShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    res.json({
      success: true,
      message: 'Showtime updated successfully.',
      data: { showtime },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({
        success: false,
        message: 'Showtime not found.',
      });
    }

    // Mark cancelled to protect booking records or hard-delete if no bookings
    showtime.status = 'cancelled';
    await showtime.save();

    res.json({
      success: true,
      message: 'Showtime cancelled successfully.',
    });
  } catch (err) {
    next(err);
  }
};
