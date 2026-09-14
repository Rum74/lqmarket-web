import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface ICoupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrder: number;
  maxDiscount?: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  description: string;
  createdAt: string;
}

const CouponSchema = new Schema<ICoupon>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountPercent: { type: Number },
    discountAmount: { type: Number },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    maxUses: { type: Number, default: 500 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: String, default: () => new Date().toISOString() },
    validTo: { type: String, default: () => new Date(Date.now() + 365 * 86400000).toISOString() },
    isActive: { type: Boolean, default: true, index: true },
    description: { type: String, default: '' },
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

const MongooseCoupon: Model<ICoupon> = (mongoose.models.Coupon as any) || mongoose.model<ICoupon>('Coupon', CouponSchema);
export const Coupon: Model<ICoupon> = createHybridModel<ICoupon>(MongooseCoupon, memoryStore.coupons);
