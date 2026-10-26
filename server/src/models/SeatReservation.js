import mongoose from 'mongoose';

const seatReservationSchema = new mongoose.Schema(
  {
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: [true, 'Showtime ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    seatIds: {
      type: [String],
      required: [true, 'At least one seat must be selected'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0 && v.length <= 10;
        },
        message: 'You can reserve between 1 and 10 seats at a time',
      },
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['held', 'confirmed', 'released', 'expired'],
      default: 'held',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically prune historical expired reservations from storage
seatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
seatReservationSchema.index({ showtimeId: 1, status: 1, expiresAt: 1 });

export const SeatReservation = mongoose.model('SeatReservation', seatReservationSchema);
