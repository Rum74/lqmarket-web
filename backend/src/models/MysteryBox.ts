import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IMysteryBox {
  id: string;
  tier: string;
  name: string;
  tagline?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  tagText?: string;
  color?: string;
  colorGradient?: string;
  borderColor?: string;
  iconBg?: string;
  accentColor?: string;
  stockRemaining?: number;
  totalOpened?: number;
  isActive?: boolean;
  jackpotPreview?: string;
  highlightText?: string;
  iconName?: string;
}

const MysteryBoxSchema = new Schema<IMysteryBox>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tier: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    badge: { type: String, default: 'HOT' },
    tagText: { type: String, default: '' },
    color: { type: String, default: 'from-amber-500 to-yellow-600' },
    colorGradient: { type: String, default: 'from-amber-600/80 via-yellow-700/60 to-slate-950' },
    borderColor: { type: String, default: 'border-amber-500/60 hover:border-amber-400' },
    iconBg: { type: String, default: 'bg-amber-500/20 text-amber-300' },
    accentColor: { type: String, default: '#F59E0B' },
    stockRemaining: { type: Number, default: 999 },
    totalOpened: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    jackpotPreview: { type: String, default: '' },
    highlightText: { type: String, default: '' },
    iconName: { type: String, default: 'Gift' }
  },
  {
    timestamps: true,
    strict: false,
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
