import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'wallet' | 'account' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['order', 'wallet', 'account', 'system'], default: 'system', index: true },
    read: { type: Boolean, default: false, index: true },
    link: { type: String },
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

const MongooseNotification: Model<INotification> = (mongoose.models.Notification as any) || mongoose.model<INotification>('Notification', NotificationSchema);
export const Notification: Model<INotification> = createHybridModel<INotification>(MongooseNotification, memoryStore.notifications);
