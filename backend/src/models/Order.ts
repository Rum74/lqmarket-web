import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IOrder {
  id: string;
  orderCode: string;
  accountId: string;
  accountCode: string;
  accountTitle: string;
  accountPrice: number;
  fee: number;
  discountAmount?: number;
  voucherCode?: string;
  totalAmount: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  status: 'pending_payment' | 'escrow_hold' | 'account_delivered' | 'completed' | 'disputed' | 'refunded' | 'cancelled';
  credentialsDelivered?: {
    username: string;
    password: string;
    securityType: string;
    secretNotes?: string;
  };
  disputeReason?: string;
  disputeResolvedBy?: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  createdAt: string;
  completedAt?: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderCode: { type: String, required: true, unique: true, index: true },
    accountId: { type: String, required: true, index: true },
    accountCode: { type: String, required: true },
    accountTitle: { type: String, required: true },
    accountPrice: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    voucherCode: { type: String },
    totalAmount: { type: Number, required: true },
    buyerId: { type: String, required: true, index: true },
    buyerName: { type: String, default: '' },
    sellerId: { type: String, required: true, index: true },
    sellerName: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending_payment', 'escrow_hold', 'account_delivered', 'completed', 'disputed', 'refunded', 'cancelled'],
      default: 'account_delivered',
      index: true
    },
    credentialsDelivered: {
      username: { type: String, default: '' },
      password: { type: String, default: '' },
      securityType: { type: String, default: 'Trắng Thông Tin' },
      secretNotes: { type: String, default: '' }
    },
    disputeReason: { type: String },
    disputeResolvedBy: { type: String },
    review: {
      rating: { type: Number },
      comment: { type: String },
      createdAt: { type: String }
    },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    completedAt: { type: String }
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

const MongooseOrder: Model<IOrder> = (mongoose.models.Order as any) || mongoose.model<IOrder>('Order', OrderSchema);
export const Order: Model<IOrder> = createHybridModel<IOrder>(MongooseOrder, memoryStore.orders);
