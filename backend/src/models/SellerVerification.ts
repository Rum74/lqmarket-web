import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface ISellerVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  fullName?: string;
  phone?: string;
  userAvatar?: string;
  idCardNumber: string;
  socialLink?: string;
  zaloPhone?: string;
  agreedWarranty?: boolean;
  warrantyCommitment?: boolean;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const SellerVerificationSchema = new Schema<ISellerVerification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, default: '' },
    userPhone: { type: String, default: '' },
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    idCardNumber: { type: String, required: true },
    socialLink: { type: String, default: '' },
    zaloPhone: { type: String, default: '' },
    agreedWarranty: { type: Boolean, default: true },
    warrantyCommitment: { type: Boolean, default: true },
    idCardFrontImage: { type: String, default: '' },
    idCardBackImage: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    rejectionReason: { type: String },
    appliedAt: { type: String, default: () => new Date().toISOString(), index: true },
    reviewedAt: { type: String },
    reviewedBy: { type: String }
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

const MongooseSellerVerification: Model<ISellerVerification> =
  (mongoose.models.SellerVerification as any) ||
  mongoose.model<ISellerVerification>('SellerVerification', SellerVerificationSchema);

export const SellerVerification: Model<ISellerVerification> =
  createHybridModel<ISellerVerification>(MongooseSellerVerification, memoryStore.sellerVerifications);
