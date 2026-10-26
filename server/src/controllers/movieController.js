import { Movie } from '../models/Movie.js';
import { seedInitialData } from '../utils/seedData.js';

let isSeeding = false;

export const getMovies = async (req, res, next) => {
  try {
    // Automatically seed movies if database is empty on first deployment
    const totalMoviesInDb = await Movie.countDocuments();
    if (totalMoviesInDb === 0 && !isSeeding) {
      isSeeding = true;
      try {
        console.log('[AutoSeed] Database empty. Seeding initial demonstration data...');
        await seedInitialData();
      } catch (seedErr) {
        console.error('[AutoSeed] Failed to auto-seed database:', seedErr);
      } finally {
        isSeeding = false;
      }
    }

    const {
      search,

      genre,
      status,
      language,
      featured,
      sort = 'latest',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    } else {
      query.status = { $ne: 'inactive' };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [genre] };
    }

    if (language && language !== 'All') {
      query.languages = { $in: [language] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { synopsis: searchRegex }, { director: searchRegex }];
    }

    let sortOptions = { releaseDate: -1 };
    if (sort === 'rating') {
      sortOptions = { rating: -1, releaseDate: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'oldest') {
      sortOptions = { releaseDate: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Movie.countDocuments(query),
    ]);

    // Unique genres for filter tags
    const allGenres = await Movie.distinct('genres', { status: { $ne: 'inactive' } });
    const allLanguages = await Movie.distinct('languages', { status: { $ne: 'inactive' } });

    res.json({
      success: true,
      message: 'Movies retrieved successfully.',
      data: {
        movies,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
        filters: {
          availableGenres: allGenres,
          availableLanguages: allLanguages,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.json({
      success: true,
      message: 'Movie details retrieved.',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

export const getMovieBySlug = async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug.toLowerCase() });
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.json({
      success: true,
      message: 'Movie details retrieved.',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

export const createMovie = async (req, res, next) => {
  try {
    const { title, slug } = req.body;
    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const movie = await Movie.create({
      ...req.body,
      slug: finalSlug,
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully.',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

export const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully.',
      data: { movie },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.json({
      success: true,
      message: 'Movie removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};
