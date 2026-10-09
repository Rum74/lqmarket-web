import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IPromotion {
  id: string;
  code: string;
  title: string;
  description: string;
  bannerUrl?: string;
  terms?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaAction?: 'navigate' | 'copy_code' | 'open_deposit';
  type: 'deposit_bonus' | 'account_discount' | 'banner_announcement';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'out_of_budget';
  isActive: boolean;
  priority: number;
  showPopup: boolean;
  popupDelaySeconds: number;
  popupFrequency: 'once_per_session' | 'once_per_day' | 'every_time';
  hideHoursAfterClose: number;
  targetAudience: 'all' | 'guest_only' | 'logged_in' | 'new_users_only' | 'first_time_deposit';
  
  // Deposit Bonus Rules
  bonusPercent?: number;
  bonusAmount?: number;
  minDeposit?: number;
  maxBonusPerTx?: number;
  maxBonusPerUser?: number;
  firstDepositOnly?: boolean;

  // Account Discount Rules
  discountPercent?: number;
  discountAmount?: number;
  minOrder?: number;
  maxDiscount?: number;
  maxUsesPerUser?: number;

  // Budget & Usage Limits
  totalBudget: number;
  spentBudget: number;
  maxUses: number;
  usedCount: number;

  // Analytics
  impressions: number;
  clicks: number;

  // Schedule (Asia/Ho_Chi_Minh reference)
  startDate: string;
  endDate: string;

  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    terms: { type: String, default: '' },
    ctaText: { type: String, default: 'Xem Ngay' },
    ctaUrl: { type: String, default: '/' },
    ctaAction: { type: String, enum: ['navigate', 'copy_code', 'open_deposit'], default: 'navigate' },
    type: {
      type: String,
      enum: ['deposit_bonus', 'account_discount', 'banner_announcement'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'paused', 'expired', 'out_of_budget'],
      default: 'active',
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    priority: { type: Number, default: 10, index: true },
    showPopup: { type: Boolean, default: true, index: true },
    popupDelaySeconds: { type: Number, default: 3 },
    popupFrequency: {
      type: String,
      enum: ['once_per_session', 'once_per_day', 'every_time'],
      default: 'once_per_session'
    },
    hideHoursAfterClose: { type: Number, default: 24 },
    targetAudience: {
      type: String,
      enum: ['all', 'guest_only', 'logged_in', 'new_users_only', 'first_time_deposit'],
      default: 'all',
      index: true
    },
    bonusPercent: { type: Number, default: 0 },
    bonusAmount: { type: Number, default: 0 },
    minDeposit: { type: Number, default: 0 },
    maxBonusPerTx: { type: Number, default: 0 },
    maxBonusPerUser: { type: Number, default: 0 },
    firstDepositOnly: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    maxUsesPerUser: { type: Number, default: 1 },
    totalBudget: { type: Number, default: 0 },
    spentBudget: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    startDate: { type: String, default: () => new Date().toISOString() },
    endDate: { type: String, default: () => new Date(Date.now() + 30 * 86400000).toISOString() },
    createdBy: { type: String, default: 'admin' },
    updatedBy: { type: String, default: 'admin' },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
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

const MongoosePromotion: Model<IPromotion> =
  (mongoose.models.Promotion as any) || mongoose.model<IPromotion>('Promotion', PromotionSchema);
export const Promotion: Model<IPromotion> = createHybridModel<IPromotion>(
  MongoosePromotion,
  (memoryStore as any).promotions || (memoryStore.promotions = memoryStore.createCollection('promotions'))
);
