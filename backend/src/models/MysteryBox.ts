import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IMysteryBox {
  id: string;
  tier: string;
  name: string;
  tagline: string;
  description?: string;
  price: number;
  badge: string;
  color: string;
  accentColor: string;
  stockRemaining: number;
  totalOpened: number;
  isActive: boolean;
  jackpotPreview: string;
  iconName: string;
}

const MysteryBoxSchema = new Schema<IMysteryBox>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tier: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    badge: { type: String, default: 'HOT' },
    color: { type: String, default: 'from-amber-500 to-yellow-600' },
    accentColor: { type: String, default: '#F59E0B' },
    stockRemaining: { type: Number, default: 999 },
    totalOpened: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    jackpotPreview: { type: String, default: '' },
    iconName: { type: String, default: 'Gift' }
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

const MongooseMysteryBox: Model<IMysteryBox> = (mongoose.models.MysteryBox as any) || mongoose.model<IMysteryBox>('MysteryBox', MysteryBoxSchema);
export const MysteryBox: Model<IMysteryBox> = createHybridModel<IMysteryBox>(MongooseMysteryBox, memoryStore.mysteryBoxes);
