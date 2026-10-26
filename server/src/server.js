import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedInitialData } from './utils/seedData.js';
import { Movie } from './models/Movie.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed demo data if movies collection is empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[IMovies Server] No movies found in database. Seeding initial demonstration data...');
      await seedInitialData();
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🎬 IMovies Server running at http://localhost:${PORT}`);
      console.log(`🚀 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🌐 API Base:    http://localhost:${PORT}/api/v1`);
      console.log(`====================================================`);
    });

    const gracefulShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force close if graceful shutdown takes too long
      setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  }
};

startServer();
