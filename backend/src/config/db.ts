import mongoose from 'mongoose';

// Enable command buffering so queries wait safely until connection completes
mongoose.set('bufferCommands', true);

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI is not set. Operating in fallback mode.');
    isConnected = false;
    return false;
  }

  try {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection error:', error.message || error);
    isConnected = false;
    return false;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('📡 MongoDB Atlas connection established.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.warn('⚠️ MongoDB connection error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('🔌 MongoDB disconnected.');
});

export function getDBConnectionStatus(): boolean {
  // If MONGODB_URI is provided, prioritize MongoDB connection
  if (process.env.MONGODB_URI) {
    return mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;
  }
  return isConnected && mongoose.connection.readyState === 1;
}
