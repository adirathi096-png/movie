import { createApp } from '../src/app.js';
import { connectDB } from '../src/config/db.js';

const app = createApp();

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Vercel Serverless] Database connection failure:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is correctly configured in Vercel.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }

  return app(req, res);
}
