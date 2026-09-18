import mongoose from 'mongoose';
import { ensureReferralCollection } from '../models/Referral';
import { ensureReferralSettingCollection } from '../models/ReferralSetting';

// Disable command buffering so queries do not hang indefinitely when disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const MONGODB_URI = process.env.MONGODB_URI || '';

  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    await syncCollections();
    return true;
  }

  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI is not set. Operating in fallback mode.');
    isConnected = false;
    return false;
  }

  try {
    const opts: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to prevent IPv6 DNS timeout delays on cloud containers
      maxPoolSize: 25,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      autoIndex: true
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, opts);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');
    await syncCollections();
    return true;
  } catch (error: any) {
    console.error('❌ MongoDB Atlas connection error:', error.message || error);
    isConnected = false;
    return false;
  }
}

async function syncCollections(): Promise<void> {
  try {
    await Promise.all([
      ensureReferralCollection(),
      ensureReferralSettingCollection()
    ]);
  } catch (err: any) {
    console.warn('Sync collections notice:', err?.message || err);
  }
}

mongoose.connection.on('connected', async () => {
  isConnected = true;
  console.log('📡 MongoDB Atlas connection established.');
  await syncCollections();
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
