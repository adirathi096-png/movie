import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

export const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGODB_URI;

  try {
    if (uri) {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[DB] Connected successfully to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return mongoose.connection;
    }
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB URI (${err.message}).`);
  }

  // Fallback to MongoMemoryServer for development / zero-setup environments
  try {
    console.log('[DB] Starting In-Memory MongoDB Server for instant local development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'imovies'
      }
    });
    const memoryUri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] Connected to In-Memory MongoDB successfully at: ${memoryUri}`);
    return mongoose.connection;
  } catch (memErr) {
    console.error('[DB] Failed to connect to MongoDB and in-memory fallback failed:', memErr);
    throw memErr;
  }
};

export const disconnectDB = async () => {
  try {
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
