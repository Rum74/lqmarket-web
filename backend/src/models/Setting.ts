import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface ISetting {
  key: string;
  value: any;
  updatedAt: string;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
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

const MongooseSetting: Model<ISetting> = (mongoose.models.Setting as any) || mongoose.model<ISetting>('Setting', SettingSchema);
export const Setting: Model<ISetting> = createHybridModel<ISetting>(MongooseSetting, memoryStore.settings);
