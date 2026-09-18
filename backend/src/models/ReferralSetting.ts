import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IReferralSetting {
  id: string;
  enabled: boolean;
  rewardType?: string;
  referrerReward: number;
  referredUserReward: number;
  minimumOrderValue: number;
  description?: string;
  requireFirstOrderCompleted: boolean;
  requireAccountVerification: boolean;
  maxRewardsPerUser: number;
  updatedAt: string;
}

const ReferralSettingSchema = new Schema<IReferralSetting>(
  {
    id: { type: String, required: true, unique: true, default: 'default_referral_settings' },
    enabled: { type: Boolean, default: true },
    rewardType: { type: String, default: 'fixed_amount' },
    referrerReward: { type: Number, default: 20000 },
    referredUserReward: { type: Number, default: 10000 },
    minimumOrderValue: { type: Number, default: 200000 },
    description: { type: String, default: 'Giới thiệu bạn bè nhận thưởng tiền mặt hấp dẫn!' },
    requireFirstOrderCompleted: { type: Boolean, default: true },
    requireAccountVerification: { type: Boolean, default: true },
    maxRewardsPerUser: { type: Number, default: 100 },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'referralsettings',
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

export const MongooseReferralSetting: Model<IReferralSetting> =
  (mongoose.models.ReferralSetting as any) ||
  mongoose.model<IReferralSetting>('ReferralSetting', ReferralSettingSchema, 'referralsettings');

export const ReferralSetting: Model<IReferralSetting> = createHybridModel<IReferralSetting>(
  MongooseReferralSetting,
  memoryStore.referralSettings
);

export async function ensureReferralSettingCollection(): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections({ name: 'referralsettings' }).toArray();
      if (!collections || collections.length === 0) {
        await mongoose.connection.db.createCollection('referralsettings');
        console.log('✅ Created MongoDB Atlas collection: referralsettings');
      }
      await MongooseReferralSetting.createIndexes().catch(() => {});
    }
  } catch (err: any) {
    console.warn('[ReferralSettingModel] ensureReferralSettingCollection notice:', err?.message || err);
  }
}
