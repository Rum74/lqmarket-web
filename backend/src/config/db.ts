import mongoose from 'mongoose';
import { ensureReferralCollection } from '../models/Referral';
import { ensureReferralSettingCollection } from '../models/ReferralSetting';

// Disable command buffering so queries do not hang indefinitely when disconnected
mongoose.set('bufferCommands', false);

let isConnected = false;

const VERIFIED_ATLAS_URI = 'mongodb+srv://huynhvanphong7402_db_user:rum7402@lqmarketcluster.hf9awbe.mongodb.net/test?retryWrites=true&w=majority&appName=LQMarketCluster';

function resolveMongoUri(): string {
  let uri = (process.env.MONGODB_URI || '').trim();

  // If URI contains placeholder like <db_password> or <password>
  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    uri = uri.replace(/<db_password>|<password>/g, 'rum7402');
  }

  // If URI is empty, generic template, or contains bad credentials
  if (!uri || uri.includes('username:password@cluster')) {
    uri = VERIFIED_ATLAS_URI;
  }

  return uri;
}

export async function connectDB(): Promise<boolean> {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    await syncCollections();
    return true;
  }

  const targetUri = resolveMongoUri();

  const opts: mongoose.ConnectOptions = {
    dbName: 'test',
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

  try {
    console.log('🔄 Connecting to MongoDB Atlas (database: test)...');
    await mongoose.connect(targetUri, opts);
    isConnected = true;
    console.log(`✅ Connected to MongoDB Atlas successfully! Active Database: ${mongoose.connection.db?.databaseName || 'test'}`);
    await syncCollections();
    return true;
  } catch (error: any) {
    const errorMsg = String(error?.message || error);
    
    // If authentication failed due to bad password in environment, retry with verified credentials
    if (errorMsg.includes('bad auth') || errorMsg.includes('authentication failed')) {
      console.warn('⚠️ MongoDB primary auth failed. Attempting failover to verified cluster credentials...');
      try {
        await mongoose.disconnect().catch(() => {});
        await mongoose.connect(VERIFIED_ATLAS_URI, opts);
        isConnected = true;
        console.log('✅ Connected to MongoDB Atlas successfully with verified credentials!');
        await syncCollections();
        return true;
      } catch (retryError: any) {
        console.error('❌ MongoDB Atlas retry error:', retryError?.message || retryError);
      }
    }

    console.error('❌ MongoDB Atlas connection error:', errorMsg);
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
