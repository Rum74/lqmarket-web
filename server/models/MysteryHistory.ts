import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IMysteryHistory {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  boxTierId: string;
  boxName: string;
  rewardId: string;
  rewardType: 'account' | 'cash' | 'voucher' | 'free_turn';
  rewardTitle: string;
  rewardValue: number;
  rewardRarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  accountDelivered?: {
    username: string;
    password: string;
    securityType: string;
    secretNotes?: string;
  };
  voucherCodeDelivered?: string;
  openedAt: string;
}

const MysteryHistorySchema = new Schema<IMysteryHistory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userAvatar: { type: String, default: '' },
    boxTierId: { type: String, required: true, index: true },
    boxName: { type: String, required: true },
    rewardId: { type: String, required: true },
    rewardType: { type: String, required: true },
    rewardTitle: { type: String, required: true },
    rewardValue: { type: Number, required: true },
    rewardRarity: { type: String, default: 'common' },
    accountDelivered: {
      username: { type: String },
      password: { type: String },
      securityType: { type: String },
      secretNotes: { type: String }
    },
    voucherCodeDelivered: { type: String },
    openedAt: { type: String, default: () => new Date().toISOString(), index: true }
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

const MongooseMysteryHistory: Model<IMysteryHistory> = (mongoose.models.MysteryHistory as any) || mongoose.model<IMysteryHistory>('MysteryHistory', MysteryHistorySchema);
export const MysteryHistory: Model<IMysteryHistory> = createHybridModel<IMysteryHistory>(MongooseMysteryHistory, memoryStore.mysteryHistories);
