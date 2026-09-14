import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export type DisputeStatus =
  | 'pending'
  | 'under_review'
  | 'resolved_buyer_refund'
  | 'resolved_seller_payout'
  | 'more_info_needed';

export interface IDisputeTicket {
  id: string;
  orderId: string;
  orderCode: string;
  accountId: string;
  accountCode: string;
  accountTitle: string;
  amount: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  reason: string;
  evidencePhotos: string[];
  evidenceVideo?: string;
  buyerNote?: string;
  sellerResponse?: string;
  adminDecisionNote?: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const DisputeSchema = new Schema<IDisputeTicket>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderId: { type: String, required: true, index: true },
    orderCode: { type: String, required: true, index: true },
    accountId: { type: String, required: true },
    accountCode: { type: String, required: true },
    accountTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    sellerId: { type: String, required: true, index: true },
    sellerName: { type: String, required: true },
    reason: { type: String, required: true },
    evidencePhotos: { type: [String], default: [] },
    evidenceVideo: { type: String, default: '' },
    buyerNote: { type: String, default: '' },
    sellerResponse: { type: String, default: '' },
    adminDecisionNote: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved_buyer_refund', 'resolved_seller_payout', 'more_info_needed'],
      default: 'pending',
      index: true
    },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    resolvedAt: { type: String },
    resolvedBy: { type: String }
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

const MongooseDispute: Model<IDisputeTicket> =
  (mongoose.models.Dispute as any) || mongoose.model<IDisputeTicket>('Dispute', DisputeSchema);

export const Dispute: Model<IDisputeTicket> =
  createHybridModel<IDisputeTicket>(MongooseDispute, memoryStore.disputes);
