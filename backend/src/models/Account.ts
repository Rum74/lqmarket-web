import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IAccount {
  id: string;
  code: string;
  title: string;
  price: number;
  originalPrice?: number;
  rank: string;
  level: number;
  heroesCount: number;
  skinsCount: number;
  runePages: string;
  server: string;
  rareSkins: Array<{
    name: string;
    hero: string;
    tier: string;
    tagColor?: string;
  }>;
  notableHeroes: string[];
  badgeTag?: string;
  images: string[];
  videoUrl?: string;
  description: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerCompletedSales: number;
  sellerResponseTime: string;
  sellerVerified: boolean;
  sellerTier?: string;
  sellerReviewsCount?: number;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'hidden';
  rejectionReason?: string;
  credentials: {
    username: string;
    password: string;
    securityType: string;
    secretNotes?: string;
  };
  createdAt: string;
  views: number;
  likes: number;
  isFeatured?: boolean;
}

const AccountSchema = new Schema<IAccount>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, index: true },
    originalPrice: { type: Number },
    rank: { type: String, required: true, index: true },
    level: { type: Number, default: 30 },
    heroesCount: { type: Number, default: 0, index: true },
    skinsCount: { type: Number, default: 0, index: true },
    runePages: { type: String, default: '90/90 Full Ngọc III' },
    server: { type: String, default: 'Việt Nam' },
    rareSkins: [
      {
        name: { type: String },
        hero: { type: String },
        tier: { type: String },
        tagColor: { type: String }
      }
    ],
    notableHeroes: { type: [String], default: [] },
    badgeTag: { type: String },
    images: { type: [String], default: [] },
    videoUrl: { type: String },
    description: { type: String, default: '' },
    sellerId: { type: String, required: true, index: true },
    sellerName: { type: String, default: '' },
    sellerAvatar: { type: String, default: '' },
    sellerRating: { type: Number, default: 5.0 },
    sellerCompletedSales: { type: Number, default: 0 },
    sellerResponseTime: { type: String, default: '< 15 phút' },
    sellerVerified: { type: Boolean, default: false },
    sellerTier: { type: String, default: 'BASIC SELLER' },
    sellerReviewsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'sold', 'hidden'],
      default: 'approved',
      index: true
    },
    rejectionReason: { type: String },
    credentials: {
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      securityType: { type: String, default: 'Trắng Thông Tin' },
      secretNotes: { type: String, default: '' }
    },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true }
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

const MongooseAccount: Model<IAccount> = (mongoose.models.Account as any) || mongoose.model<IAccount>('Account', AccountSchema);
export const Account: Model<IAccount> = createHybridModel<IAccount>(MongooseAccount, memoryStore.accounts);
