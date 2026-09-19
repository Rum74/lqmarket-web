import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IBlindBagClaim {
  id: string; // bbc_xxxxx
  userId: string;
  userName?: string;
  blindBagId: string;
  blindBagAccountId: string;
  username: string;
  claimedAt: string;
  status: 'success' | 'failed';
}

const BlindBagClaimSchema = new Schema<IBlindBagClaim>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    blindBagId: { type: String, required: true, index: true },
    blindBagAccountId: { type: String, required: true, index: true },
    username: { type: String, required: true },
    claimedAt: { type: String, default: () => new Date().toISOString(), index: true },
    status: { type: String, enum: ['success', 'failed'], default: 'success' }
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

const MongooseBlindBagClaim: Model<IBlindBagClaim> =
  (mongoose.models.BlindBagClaim as any) ||
  mongoose.model<IBlindBagClaim>('BlindBagClaim', BlindBagClaimSchema);

export const BlindBagClaim = createHybridModel<IBlindBagClaim>(
  MongooseBlindBagClaim,
  memoryStore.createCollection<IBlindBagClaim>('blindbagclaims')
);
