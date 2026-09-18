import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IReferral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  qualifyingOrderId?: string | null;
  referrerReward: number;
  referredReward: number;
  status: 'pending' | 'qualified' | 'rewarded' | 'cancelled';
  rewardedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const ReferralSchema = new Schema<IReferral>(
  {
    id: { type: String, required: true, unique: true, index: true },
    referrerId: { type: String, required: true, index: true },
    referredUserId: { type: String, required: true, unique: true, index: true },
    referralCode: { type: String, required: true, uppercase: true, trim: true, index: true },
    qualifyingOrderId: { type: String, default: null, index: true },
    referrerReward: { type: Number, default: 20000 },
    referredReward: { type: Number, default: 10000 },
    status: {
      type: String,
      enum: ['pending', 'qualified', 'rewarded', 'cancelled'],
      default: 'pending',
      index: true
    },
    rewardedAt: { type: String, default: null },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'referrals',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const MongooseReferral: Model<IReferral> =
  (mongoose.models.Referral as any) || mongoose.model<IReferral>('Referral', ReferralSchema, 'referrals');

export const Referral: Model<IReferral> = createHybridModel<IReferral>(
  MongooseReferral,
  memoryStore.referrals
);

/**
 * Ensures the 'referrals' collection exists in MongoDB Atlas,
 * creating it physically and indexing it if needed.
 */
export async function ensureReferralCollection(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections({ name: 'referrals' }).toArray();
      if (!collections || collections.length === 0) {
        await mongoose.connection.db.createCollection('referrals');
        console.log('✅ Created MongoDB Atlas collection: referrals');
      }
      await MongooseReferral.createIndexes().catch(() => {});
    }
  } catch (err: any) {
    console.warn('[ReferralModel] ensureReferralCollection notice:', err?.message || err);
  }
}
