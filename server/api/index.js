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

  // If DB connection failed, return clean informative JSON without throwing 500 FUNCTION_INVOCATION_FAILED
  if (dbError) {
    const isBadAuth = dbError.includes('bad auth') || dbError.includes('authentication failed');
    return res.status(200).json({
      success: false,
      service: 'IMovies REST API',
      status: 'database_authentication_required',
      message: isBadAuth
        ? 'MongoDB Atlas Authentication Failed: The password in your MONGODB_URI is incorrect or contains unencoded special characters.'
        : 'Database connection failed. Please verify your MONGODB_URI and Atlas Network Access.',
      databaseError: dbError,
      actionRequired: isBadAuth
        ? 'Go to MongoDB Atlas -> Database Access -> Edit user "adirathi096_db_user" -> Set a new simple password (e.g. "Imovies12345") -> Update MONGODB_URI in Vercel Settings -> Redeploy.'
        : 'Ensure MONGODB_URI is configured in Vercel project settings and Network Access allows 0.0.0.0/0.',
    });
  }

  return app(req, res);
}


