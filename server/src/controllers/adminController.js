import { Booking } from '../models/Booking.js';
import { Movie } from '../models/Movie.js';
import { User } from '../models/User.js';
import { Cinema } from '../models/Cinema.js';
import { Showtime } from '../models/Showtime.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalBookings,
      confirmedBookingsCount,
      cancelledBookingsCount,
      totalUsers,
      activeMoviesCount,
      totalCinemas,
      revenueAggregation,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      User.countDocuments(),
      Movie.countDocuments({ status: 'now_showing' }),
      Cinema.countDocuments({ active: true }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } },
      ]),
      Booking.find()
        .populate('userId', 'name email')
        .populate('movieId', 'title')
        .populate('cinemaId', 'name')
        .populate('showtimeId', 'startTime format')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved.',
      data: {
        stats: {
          totalRevenue,
          totalBookings,
          confirmedBookingsCount,
          cancelledBookingsCount,
          totalUsers,
          activeMoviesCount,
          totalCinemas,
        },
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      query.bookingReference = new RegExp(search.trim(), 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('userId', 'name email phone')
        .populate('movieId', 'title')
        .populate('cinemaId', 'name city')
        .populate('screenId', 'name format')
        .populate('showtimeId', 'startTime format')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Bookings list retrieved.',
      data: {
        bookings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: 'Users list retrieved.',
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'.",
      });
    }

    // Prevent self-demotion if last admin
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke your own administrator privileges.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};
