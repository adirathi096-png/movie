import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true, // e.g. 'D5'
    },
    row: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Showtime ID is required'],
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie ID is required'],
      index: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema ID is required'],
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen ID is required'],
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeatReservation',
    },
    seats: {
      type: [bookedSeatSchema],
      required: [true, 'At least one booked seat is required'],
      validate: [v => Array.isArray(v) && v.length > 0, 'Seats array cannot be empty'],
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      convenienceFee: {
        type: Number,
        default: 30,
        min: 0,
      },
      taxes: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    payment: {
      method: {
        type: String,
        enum: ['demo_checkout', 'credit_card', 'debit_card', 'upi', 'net_banking'],
        default: 'demo_checkout',
      },
      transactionId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['paid', 'pending', 'failed', 'refunded'],
        default: 'paid',
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'expired'],
      default: 'confirmed',
      index: true,
    },
    cancellation: {
      cancelledAt: Date,
      reason: String,
      refundAmount: Number,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showtimeId: 1, status: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
