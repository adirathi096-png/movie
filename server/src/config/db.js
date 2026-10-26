import mongoose from 'mongoose';

let cachedConnection = null;
let cachedPromise = null;
let mongoMemoryServerInstance = null;

export const connectDB = async (customUri = null) => {
  // If already connected, reuse the connection (critical for serverless environments)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, await it
  if (cachedPromise) {
    return await cachedPromise;
  }

  const uri = customUri || process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`[DB] Connecting to MongoDB...`);
      cachedPromise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      });

      cachedConnection = await cachedPromise;
      console.log(`[DB] Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return cachedConnection;
    } catch (err) {
      cachedPromise = null;
      console.error(`[DB] MongoDB connection error: ${err.message}`);

      // In production, do not attempt to start in-memory server
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Failed to connect to MongoDB Atlas in production: ${err.message}. Please verify MONGODB_URI and Network Access settings in MongoDB Atlas.`
        );
      }
    }
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'MONGODB_URI environment variable is missing. Please configure your MongoDB Atlas connection string in the Vercel project settings.'
    );
  }

  // Fallback to MongoMemoryServer ONLY in development/testing environments
  try {
    console.log('[DB] Starting In-Memory MongoDB Server for local development/testing...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    if (!mongoMemoryServerInstance) {
      mongoMemoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'imovies' },
      });
    }
    const memoryUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to In-Memory MongoDB at: ${memoryUri}`);
    return mongoose.connection;
  } catch (memErr) {
    console.error('[DB] In-memory MongoDB initialization failed:', memErr);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  try {
    cachedPromise = null;
    cachedConnection = null;
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
      mongoMemoryServerInstance = null;
    }
    console.log('[DB] MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('[DB] Error during MongoDB disconnect:', err);
  }
};
