import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IDraftHero {
  id: string;
  name: string;
  title: string;
  role: string;
  secondaryRole?: string;
  secondaryRoles?: string[];
  playstyles?: string[];
  primaryLane: string;
  secondaryLane?: string;
  secondaryLanes?: string[];
  damageType: string;
  avatar: string;
  ratings: {
    tankiness: number;
    damage: number;
    crowdControl: number;
    engage: number;
    peel: number;
    mobility: number;
    earlyGame: number;
    lateGame: number;
  };
  signatureSkill: string;
  counters: string[];
  synergies: string[];
  tags: string[];
  difficulty: string;
  isActive: boolean;
  notes?: string;
  tacticalNotes?: string;
  dataSource?: string;
  lastUpdated?: string;
  createdAt: string;
  updatedAt: string;
}

const DraftHeroSchema = new Schema<IDraftHero>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: String, default: '' },
    role: { type: String, required: true },
    secondaryRole: { type: String, default: '' },
    secondaryRoles: [{ type: String }],
    playstyles: [{ type: String }],
    primaryLane: { type: String, required: true },
    secondaryLane: { type: String, default: '' },
    secondaryLanes: [{ type: String }],
    damageType: { type: String, default: 'Vật lý' },
    avatar: { type: String, default: '' },
    ratings: {
      tankiness: { type: Number, default: 5 },
      damage: { type: Number, default: 5 },
      crowdControl: { type: Number, default: 5 },
      engage: { type: Number, default: 5 },
      peel: { type: Number, default: 5 },
      mobility: { type: Number, default: 5 },
      earlyGame: { type: Number, default: 5 },
      lateGame: { type: Number, default: 5 }
    },
    signatureSkill: { type: String, default: '' },
    counters: [{ type: String }],
    synergies: [{ type: String }],
    tags: [{ type: String }],
    difficulty: { type: String, default: 'Trung bình' },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
    tacticalNotes: { type: String, default: '' },
    dataSource: { type: String, default: 'Garena Liên Quân Mobile VN (01/11/2026)' },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    collection: 'draftheroes',
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

export const MongooseDraftHero: Model<IDraftHero> =
  (mongoose.models.DraftHero as any) ||
  mongoose.model<IDraftHero>('DraftHero', DraftHeroSchema, 'draftheroes');

export const DraftHero: Model<IDraftHero> = createHybridModel<IDraftHero>(
  MongooseDraftHero,
  memoryStore.createCollection('draftHeroes')
);
