import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const app = createApp();

export default async function handler(req, res) {
  let dbError = null;

  try {
    await connectDB();
  } catch (err) {
    dbError = err.message;
    console.error('[Vercel Serverless] Database connection failure:', err.message);
  }

  // If DB failed and request is a status or root check, provide clear diagnostic without crashing
  if (dbError && (req.url === '/' || req.url === '/api' || req.url === '/api/v1' || req.url?.includes('health'))) {
    return res.status(200).json({
      success: true,
      service: 'IMovies REST API',
      status: 'online',
      database: 'disconnected',
      databaseError: dbError,
      hint: 'Please check your MONGODB_URI in Vercel project settings. Ensure MongoDB Atlas Network Access has 0.0.0.0/0 allowed and user password is correct.',
    });
  }

  if (dbError) {
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured in Vercel.',
      databaseError: dbError,
    });
  }

  return app(req, res);
}

