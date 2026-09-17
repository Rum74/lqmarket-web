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

const MongooseReferral: Model<IReferral> =
  (mongoose.models.Referral as any) || mongoose.model<IReferral>('Referral', ReferralSchema);

export const Referral: Model<IReferral> = createHybridModel<IReferral>(
  MongooseReferral,
  memoryStore.referrals
);
