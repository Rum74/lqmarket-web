import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IReferralSetting {
  id: string;
  enabled: boolean;
  referrerReward: number;
  referredUserReward: number;
  minimumOrderValue: number;
  requireFirstOrderCompleted: boolean;
  requireAccountVerification: boolean;
  maxRewardsPerUser: number;
  updatedAt: string;
}

const ReferralSettingSchema = new Schema<IReferralSetting>(
  {
    id: { type: String, required: true, unique: true, default: 'default_referral_settings' },
    enabled: { type: Boolean, default: true },
    referrerReward: { type: Number, default: 20000 },
    referredUserReward: { type: Number, default: 10000 },
    minimumOrderValue: { type: Number, default: 200000 },
    requireFirstOrderCompleted: { type: Boolean, default: true },
    requireAccountVerification: { type: Boolean, default: true },
    maxRewardsPerUser: { type: Number, default: 100 },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
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

const MongooseReferralSetting: Model<IReferralSetting> =
  (mongoose.models.ReferralSetting as any) ||
  mongoose.model<IReferralSetting>('ReferralSetting', ReferralSettingSchema);

export const ReferralSetting: Model<IReferralSetting> = createHybridModel<IReferralSetting>(
  MongooseReferralSetting,
  memoryStore.referralSettings
);
