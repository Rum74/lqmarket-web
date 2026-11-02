import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore.js';

export interface IAIAnalysisCache {
  id: string;
  cacheKey: string;
  teamAName: string;
  teamBName: string;
  teamAHeroIds: string[];
  teamBHeroIds: string[];
  patchVersion: string;
  aiModel: string;
  isGrounded: boolean;
  verdict: any;
  laneMatchups: any;
  synergies: any;
  gamePhaseStrategy: any;
  winConditions: any;
  proMetaReference: any;
  reliability: any;
  sources: any[];
  rawText?: string;
  createdAt: string;
  updatedAt: string;
}

const AIAnalysisCacheSchema = new Schema<IAIAnalysisCache>(
  {
    id: { type: String, required: true, unique: true },
    cacheKey: { type: String, required: true, index: true },
    teamAName: { type: String, default: 'Đội A' },
    teamBName: { type: String, default: 'Đội B' },
    teamAHeroIds: [{ type: String }],
    teamBHeroIds: [{ type: String }],
    patchVersion: { type: String, default: '2026.11 (S4-2026)' },
    aiModel: { type: String, default: 'gemini-3.8-flash' },
    isGrounded: { type: Boolean, default: true },
    verdict: { type: Schema.Types.Mixed, default: {} },
    laneMatchups: { type: Schema.Types.Mixed, default: [] },
    synergies: { type: Schema.Types.Mixed, default: {} },
    gamePhaseStrategy: { type: Schema.Types.Mixed, default: {} },
    winConditions: { type: Schema.Types.Mixed, default: {} },
    proMetaReference: { type: Schema.Types.Mixed, default: {} },
    reliability: { type: Schema.Types.Mixed, default: {} },
    sources: { type: Schema.Types.Mixed, default: [] },
    rawText: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'aianalysiscaches',
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

export const MongooseAIAnalysisCache: Model<IAIAnalysisCache> =
  (mongoose.models.AIAnalysisCache as any) ||
  mongoose.model<IAIAnalysisCache>('AIAnalysisCache', AIAnalysisCacheSchema, 'aianalysiscaches');

export const AIAnalysisCache: Model<IAIAnalysisCache> = createHybridModel<IAIAnalysisCache>(
  MongooseAIAnalysisCache,
  memoryStore.createCollection('aiAnalysisCaches')
);
