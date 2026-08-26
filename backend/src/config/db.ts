import mongoose from 'mongoose';

// Disable command buffering so queries don't hang if disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return true;
  }

  if (!MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set. LQMarket Backend is operating with High-Speed In-Memory & Local Storage Fallback.');
    console.warn('👉 To connect persistent database, set MONGODB_URI=mongodb+srv://... in your .env file.');
    isConnected = false;
    return false;
  }

  try {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection error:', error.message || error);
    console.log('💡 TIP: Check if your VPS / server IP is allowed in MongoDB Atlas Network Access (e.g. 0.0.0.0/0).');
    console.log('ℹ️ Operating in high-speed resilient in-memory mode.');
    isConnected = false;
    return false;
  }
}

mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('📡 MongoDB connection established.');
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
  return isConnected && mongoose.connection.readyState === 1;
}
