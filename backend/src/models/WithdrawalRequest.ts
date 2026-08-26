import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IWithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  bankName: string;
  bankCode?: string;
  bankAccount: string;
  bankAccountName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  referenceNote?: string;
  processedAt?: string;
  createdAt: string;
}

const WithdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    amount: { type: Number, required: true },
    bankName: { type: String, required: true },
    bankCode: { type: String },
    bankAccount: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    rejectionReason: { type: String },
    referenceNote: { type: String },
    processedAt: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true }
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

const MongooseWithdrawalRequest: Model<IWithdrawalRequest> = (mongoose.models.WithdrawalRequest as any) || mongoose.model<IWithdrawalRequest>('WithdrawalRequest', WithdrawalRequestSchema);
export const WithdrawalRequest: Model<IWithdrawalRequest> = createHybridModel<IWithdrawalRequest>(MongooseWithdrawalRequest, memoryStore.withdrawalRequests);
