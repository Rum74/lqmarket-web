import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IPriceAlert {
  id: string;
  userId: string;
  accountId: string;
  accountCode: string;
  accountTitle: string;
  initialPrice: number;
  currentPrice?: number;
  targetPrice: number;
  createdAt: string;
  isTriggered: boolean;
  notifiedAt?: string;
}

const PriceAlertSchema = new Schema<IPriceAlert>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    accountCode: { type: String, required: true },
    accountTitle: { type: String, required: true },
    initialPrice: { type: Number, required: true },
    currentPrice: { type: Number },
    targetPrice: { type: Number, required: true },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    isTriggered: { type: Boolean, default: false, index: true },
    notifiedAt: { type: String }
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

const MongoosePriceAlert: Model<IPriceAlert> =
  (mongoose.models.PriceAlert as any) || mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);

export const PriceAlert: Model<IPriceAlert> =
  createHybridModel<IPriceAlert>(MongoosePriceAlert, memoryStore.priceAlerts);
