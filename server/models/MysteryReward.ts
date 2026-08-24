import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IMysteryReward {
  id: string;
  boxTierId: string;
  type: 'account' | 'cash' | 'voucher' | 'free_turn';
  title: string;
  description: string;
  value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  dropRate: number;
  dropWeight: number;
  imageUrl: string;
  stock?: number;
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
}

const MysteryRewardSchema = new Schema<IMysteryReward>(
  {
    id: { type: String, required: true, unique: true, index: true },
    boxTierId: { type: String, required: true, index: true },
    type: { type: String, enum: ['account', 'cash', 'voucher', 'free_turn'], required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    value: { type: Number, required: true },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary', 'mythic'], default: 'common' },
    dropRate: { type: Number, default: 10 },
    dropWeight: { type: Number, default: 100 },
    imageUrl: { type: String, default: '' },
    stock: { type: Number },
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
    voucherDiscount: { type: Number }
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

const MongooseMysteryReward: Model<IMysteryReward> = (mongoose.models.MysteryReward as any) || mongoose.model<IMysteryReward>('MysteryReward', MysteryRewardSchema);
export const MysteryReward: Model<IMysteryReward> = createHybridModel<IMysteryReward>(MongooseMysteryReward, memoryStore.mysteryRewards);
