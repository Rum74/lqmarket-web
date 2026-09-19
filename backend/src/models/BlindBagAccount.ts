import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IBlindBagAccount {
  id: string; // bga_xxxxx
  username: string;
  password: string;
  blindBagId: string; // ID của túi mù (vd: box_bronze, blindbag_1000, etc.)
  status: 'available' | 'reserved' | 'claimed' | 'disabled';
  claimedBy?: string | null;
  claimedByName?: string | null;
  claimedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const BlindBagAccountSchema = new Schema<IBlindBagAccount>(
  {
    id: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true, trim: true },
    password: { type: String, required: true },
    blindBagId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['available', 'reserved', 'claimed', 'disabled'],
      default: 'available',
      index: true
    },
    claimedBy: { type: String, default: null, index: true },
    claimedByName: { type: String, default: null },
    claimedAt: { type: String, default: null },
    notes: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
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

// Compound index for fast atomic pop: blindBagId + status
BlindBagAccountSchema.index({ blindBagId: 1, status: 1 });

const MongooseBlindBagAccount: Model<IBlindBagAccount> =
  (mongoose.models.BlindBagAccount as any) ||
  mongoose.model<IBlindBagAccount>('BlindBagAccount', BlindBagAccountSchema);

export const BlindBagAccount = createHybridModel<IBlindBagAccount>(
  MongooseBlindBagAccount,
  memoryStore.createCollection<IBlindBagAccount>('blindbagaccounts')
);
