import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: [true, 'Screen ID is required'],
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
      default: '2D',
    },
    pricing: {
      standard: {
        type: Number,
        required: true,
        default: 250,
      },
      premium: {
        type: Number,
        required: true,
        default: 350,
      },
      vip: {
        type: Number,
        required: true,
        default: 500,
      },
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

showtimeSchema.index({ movieId: 1, startTime: 1 });
showtimeSchema.index({ cinemaId: 1, startTime: 1 });
showtimeSchema.index({ screenId: 1, startTime: 1 });

export const Showtime = mongoose.model('Showtime', showtimeSchema);
