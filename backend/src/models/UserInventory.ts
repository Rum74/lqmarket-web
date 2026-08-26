import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IUserInventory {
  id: string;
  userId: string;
  source: 'mystery_box' | 'event' | 'reward';
  rewardType: 'account' | 'voucher' | 'cash' | 'free_turn';
  title: string;
  value: number;
  rarity?: string;
  accountData?: {
    rank: string;
    heroesCount: number;
    skinsCount: number;
    rareSkinName: string;
    credentials: {
      username: string;
      password: string;
      securityType: string;
      secretNotes?: string;
    };
  };
  voucherCode?: string;
  voucherDiscount?: number;
  isUsed: boolean;
  usedAt?: string;
  receivedAt: string;
}

const UserInventorySchema = new Schema<IUserInventory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    source: { type: String, default: 'mystery_box' },
    rewardType: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: Number, default: 0 },
    rarity: { type: String, default: 'common' },
    accountData: {
      rank: { type: String },
      heroesCount: { type: Number },
      skinsCount: { type: Number },
      rareSkinName: { type: String },
      credentials: {
        username: { type: String },
        password: { type: String },
        securityType: { type: String },
        secretNotes: { type: String }
      }
    },
    voucherCode: { type: String },
    voucherDiscount: { type: Number },
    isUsed: { type: Boolean, default: false, index: true },
    usedAt: { type: String },
    receivedAt: { type: String, default: () => new Date().toISOString(), index: true }
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

const MongooseUserInventory: Model<IUserInventory> = (mongoose.models.UserInventory as any) || mongoose.model<IUserInventory>('UserInventory', UserInventorySchema);
export const UserInventory: Model<IUserInventory> = createHybridModel<IUserInventory>(MongooseUserInventory, memoryStore.userInventories);
