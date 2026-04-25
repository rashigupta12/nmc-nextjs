import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URL!;

if (!MONGODB_URI) {
  throw new Error('❌ Please define MONGODB_URL in .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-ignore
let cached: MongooseCache = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectToMongoDB() {
  const TARGET_DB = 'genetic-core';

  // 🔥 IMPORTANT FIX: Check DB name before reusing
  if (cached.conn) {
    const currentDb = cached.conn.connection.name;

    if (currentDb === TARGET_DB) {
      console.log('⚡ Using cached MongoDB connection:', currentDb);
      return cached.conn;
    }

    // ❌ Wrong DB → disconnect and reconnect
    console.log(`⚠️ Cached DB is "${currentDb}", switching to "${TARGET_DB}"`);

    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    console.log('🚀 Connecting to MongoDB (fresh)...');

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: TARGET_DB, // 🔥 FORCE correct DB
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log('✅ Connected to DB:', cached.conn.connection.name);

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}