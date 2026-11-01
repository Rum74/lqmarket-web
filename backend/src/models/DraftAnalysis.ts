import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IDraftAnalysis {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  title: string;
  teamAName: string;
  teamBName: string;
  teamAHeroIds: string[];
  teamBHeroIds: string[];
  teamAHeroes?: any[];
  teamBHeroes?: any[];
  evaluationA?: any;
  evaluationB?: any;
  headToHead?: any;
  isSaved: boolean;
  viewCount: number;
  shareCode?: string;
  createdAt: string;
  updatedAt: string;
}

const DraftAnalysisSchema = new Schema<IDraftAnalysis>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, default: null, index: true },
    userEmail: { type: String, default: '' },
    userName: { type: String, default: '' },
    title: { type: String, default: 'Phân tích đội hình LQ' },
    teamAName: { type: String, default: 'Đội A (Xanh)' },
    teamBName: { type: String, default: 'Đội B (Đỏ)' },
    teamAHeroIds: [{ type: String }],
    teamBHeroIds: [{ type: String }],
    teamAHeroes: { type: Schema.Types.Mixed, default: [] },
    teamBHeroes: { type: Schema.Types.Mixed, default: [] },
    evaluationA: { type: Schema.Types.Mixed, default: null },
    evaluationB: { type: Schema.Types.Mixed, default: null },
    headToHead: { type: Schema.Types.Mixed, default: null },
    isSaved: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 1 },
    shareCode: { type: String, default: null, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'draftanalyses',
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

export const MongooseDraftAnalysis: Model<IDraftAnalysis> =
  (mongoose.models.DraftAnalysis as any) ||
  mongoose.model<IDraftAnalysis>('DraftAnalysis', DraftAnalysisSchema, 'draftanalyses');

export const DraftAnalysis: Model<IDraftAnalysis> = createHybridModel<IDraftAnalysis>(
  MongooseDraftAnalysis,
  memoryStore.createCollection('draftAnalyses')
);
