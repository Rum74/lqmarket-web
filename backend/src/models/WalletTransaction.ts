import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IWalletTransaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  type: 'deposit' | 'withdraw' | 'purchase' | 'seller_payout' | 'refund';
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  note: string;
  bankName?: string;
  bankCode?: string;
  bankAccount?: string;
  bankAccountName?: string;
  orderCode?: number;
  paymentLinkId?: string;
  rejectReason?: string;
  processedAt?: string;
  createdAt: string;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'purchase', 'seller_payout', 'refund'],
      required: true,
      index: true
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    note: { type: String, default: '' },
    bankName: { type: String },
    bankCode: { type: String },
    bankAccount: { type: String },
    bankAccountName: { type: String },
    orderCode: { type: Number, index: true },
    paymentLinkId: { type: String },
    rejectReason: { type: String },
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

const MongooseWalletTransaction: Model<IWalletTransaction> = (mongoose.models.WalletTransaction as any) || mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);
export const WalletTransaction: Model<IWalletTransaction> = createHybridModel<IWalletTransaction>(MongooseWalletTransaction, memoryStore.walletTransactions);
