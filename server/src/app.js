import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import cinemaRoutes from './routes/cinemaRoutes.js';
import showtimeRoutes from './routes/showtimeRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

export const createApp = () => {
  const app = express();

  // Security headers
  app.use(helmet());

  // Configure CORS with multi-origin and Vercel preview support
  const configuredClientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((u) => u.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  const allowedOrigins = [...new Set([...configuredClientUrls, ...localOrigins])];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, serverless health probes, same origin)
        if (!origin) {
          return callback(null, true);
        }

        // Exact match in allowed origins list
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow Vercel preview deployments (*.vercel.app)
        if (origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }

        // Non-production fallback
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }

        callback(new Error(`Origin '${origin}' not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsing
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // General rate limiter
  app.use('/api', apiLimiter);

  // Health routes at multiple canonical paths for universal monitoring
  app.use('/api/v1/health', healthRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/health', healthRoutes);

  // Mount API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/movies', movieRoutes);
  app.use('/api/v1/cinemas', cinemaRoutes);
  app.use('/api/v1/showtimes', showtimeRoutes);
  app.use('/api/v1/reservations', reservationRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Alias mounts under /v1 (in case a reverse proxy rewrite strips /api)
  app.use('/v1/auth', authRoutes);
  app.use('/v1/movies', movieRoutes);
  app.use('/v1/cinemas', cinemaRoutes);
  app.use('/v1/showtimes', showtimeRoutes);
  app.use('/v1/reservations', reservationRoutes);
  app.use('/v1/bookings', bookingRoutes);
  app.use('/v1/admin', adminRoutes);

  // Root welcome / health route
  const rootHandler = (req, res) => {
    res.json({
      success: true,
      message: 'IMovies REST API is running.',
      version: '1.0.0',
      health: '/api/v1/health',
      docs: '/api/v1',
    });
  };

  app.get('/', rootHandler);
  app.get('/api', rootHandler);
  app.get('/api/v1', rootHandler);

  // 404 & centralized error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
