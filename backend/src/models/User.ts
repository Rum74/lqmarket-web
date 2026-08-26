import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  role: 'buyer' | 'seller' | 'admin';
  balance: number;
  pendingBalance: number;
  rating: number;
  completedSales: number;
  isVerifiedSeller: boolean;
  sellerTier: 'FREE' | 'BASIC' | 'PRO' | 'VIP';
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  bio?: string;
  wishlistIds: string[];
  status: 'active' | 'banned' | 'pending';
  createdAt: string;
  updatedAt?: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: false },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer', index: true },
    balance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 },
    completedSales: { type: Number, default: 0 },
    isVerifiedSeller: { type: Boolean, default: false },
    sellerTier: { type: String, enum: ['FREE', 'BASIC', 'PRO', 'VIP'], default: 'FREE' },
    bankName: { type: String, default: '' },
    bankAccount: { type: String, default: '' },
    bankAccountName: { type: String, default: '' },
    bio: { type: String, default: '' },
    wishlistIds: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'banned', 'pending'], default: 'active' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

const MongooseUser: Model<IUser> = (mongoose.models.User as any) || mongoose.model<IUser>('User', UserSchema);
export const User: Model<IUser> = createHybridModel<IUser>(MongooseUser, memoryStore.users);
