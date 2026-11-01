import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IDraftSetting {
  id: string;
  enabled: boolean;
  allowDuplicatesBetweenTeams: boolean;
  maxSavedDraftsFree: number;
  maxSavedDraftsPremium: number;
  tacticalWeights: {
    laneBalance: number;
    damageBalance: number;
    teamfight: number;
    tankiness: number;
    crowdControl: number;
    peel: number;
  };
  announcementNotice: string;
  updatedAt: string;
}

const DraftSettingSchema = new Schema<IDraftSetting>(
  {
    id: { type: String, required: true, unique: true, default: 'default_draft_settings' },
    enabled: { type: Boolean, default: true },
    allowDuplicatesBetweenTeams: { type: Boolean, default: false },
    maxSavedDraftsFree: { type: Number, default: 10 },
    maxSavedDraftsPremium: { type: Number, default: 100 },
    tacticalWeights: {
      laneBalance: { type: Number, default: 25 },
      damageBalance: { type: Number, default: 15 },
      teamfight: { type: Number, default: 20 },
      tankiness: { type: Number, default: 15 },
      crowdControl: { type: Number, default: 15 },
      peel: { type: Number, default: 10 }
    },
    announcementNotice: {
      type: String,
      default: 'LQ Draft Lab – Phòng phân tích đội hình Liên Quân Mobile chính thức hoạt động! Phân tích chiến thuật & so sánh đội hình chuẩn xác.'
    },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'draftsettings',
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

export const MongooseDraftSetting: Model<IDraftSetting> =
  (mongoose.models.DraftSetting as any) ||
  mongoose.model<IDraftSetting>('DraftSetting', DraftSettingSchema, 'draftsettings');

export const DraftSetting: Model<IDraftSetting> = createHybridModel<IDraftSetting>(
  MongooseDraftSetting,
  memoryStore.createCollection('draftSettings')
);
