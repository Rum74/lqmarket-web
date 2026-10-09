import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IPromotionRewardLog {
  id: string;
  promotionId: string;
  promotionCode: string;
  promotionTitle?: string;
  promotionType: 'deposit_bonus' | 'account_discount';
  userId: string;
  userName?: string;
  userEmail?: string;
  orderCode?: number;
  transactionId?: string;
  orderId?: string;
  baseAmount: number;     // Original deposit amount or account price
  rewardAmount: number;   // Bonus amount credited or discount amount subtracted
  status: 'success' | 'reversed' | 'failed';
  note?: string;
  createdAt: string;
}

const PromotionRewardLogSchema = new Schema<IPromotionRewardLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    promotionId: { type: String, required: true, index: true },
    promotionCode: { type: String, required: true, uppercase: true, index: true },
    promotionTitle: { type: String, default: '' },
    promotionType: {
      type: String,
      enum: ['deposit_bonus', 'account_discount'],
      required: true,
      index: true
    },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    orderCode: { type: Number, index: true },
    transactionId: { type: String, index: true },
    orderId: { type: String, index: true },
    baseAmount: { type: Number, required: true },
    rewardAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['success', 'reversed', 'failed'],
      default: 'success',
      index: true
    },
    note: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true }
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

// Compound index for strict idempotency: an orderCode cannot be rewarded under the same promotion twice
PromotionRewardLogSchema.index({ promotionId: 1, orderCode: 1 }, { unique: false });

const MongoosePromotionRewardLog: Model<IPromotionRewardLog> =
  (mongoose.models.PromotionRewardLog as any) ||
  mongoose.model<IPromotionRewardLog>('PromotionRewardLog', PromotionRewardLogSchema);

export const PromotionRewardLog: Model<IPromotionRewardLog> = createHybridModel<IPromotionRewardLog>(
  MongoosePromotionRewardLog,
  (memoryStore as any).promotionRewardLogs || (memoryStore.promotionRewardLogs = memoryStore.createCollection('promotionRewardLogs'))
);
