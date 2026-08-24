import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI is not set. LQMarket Backend is operating with High-Speed In-Memory & Local Fallback.');
    isConnected = false;
    return false;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');
    return true;
  } catch (error: any) {
    console.warn('⚠️ MongoDB Atlas connection notice:', error.message || error);
    console.log('ℹ️ Running in resilient In-Memory Store mode.');
    isConnected = false;
    return false;
  }
}

export function getDBConnectionStatus(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}
