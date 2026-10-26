import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true, // e.g. 'A1', 'E8'
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    isAccessible: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const rowSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      required: true, // e.g. 'A', 'B', 'C'
    },
    category: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
    },
    seats: [seatSchema],
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true,
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: '2D',
    },
    totalSeats: {
      type: Number,
      required: true,
      default: 0,
    },
    seatLayout: [rowSchema],
  },
  {
    timestamps: true,
  }
);

export const Screen = mongoose.model('Screen', screenSchema);
