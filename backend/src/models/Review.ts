import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IReview {
  id: string;
  orderId: string;
  accountId: string;
  accountCode: string;
  accountTitle?: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    accountCode: { type: String, required: true },
    accountTitle: { type: String, default: '' },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, default: '' },
    sellerId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
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

const MongooseReview: Model<IReview> = (mongoose.models.Review as any) || mongoose.model<IReview>('Review', ReviewSchema);
export const Review: Model<IReview> = createHybridModel<IReview>(MongooseReview, memoryStore.reviews);
