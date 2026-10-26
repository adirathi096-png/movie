import express from 'express';
import mongoose from 'mongoose';
import { seedInitialData } from '../utils/seedData.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    success: true,
    message: 'IMovies API is healthy and operational.',
    data: {
      service: 'IMovies Platform API',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

router.all('/seed', async (req, res) => {
  try {
    const result = await seedInitialData();
    res.json({
      success: true,
      message: 'Database seeded successfully with movies, cinemas, and showtimes!',
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Seeding failed: ' + err.message,
    });
  }
});

export default router;

