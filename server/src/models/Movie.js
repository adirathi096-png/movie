import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Movie slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    synopsis: {
      type: String,
      required: [true, 'Synopsis is required'],
      trim: true,
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required'],
      trim: true,
    },
    backdropUrl: {
      type: String,
      trim: true,
      default: '',
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    languages: {
      type: [String],
      default: ['English'],
      index: true,
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
      index: true,
    },
    certification: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'UA', 'A'],
      default: 'UA',
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'inactive'],
      default: 'now_showing',
      index: true,
    },
    trailerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.5,
    },
    ratingSource: {
      type: String,
      default: 'IMDb',
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

movieSchema.index({ title: 'text', synopsis: 'text' });

export const Movie = mongoose.model('Movie', movieSchema);
