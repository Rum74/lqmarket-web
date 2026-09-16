import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  amount?: number;
  timestamp: string;
  ip?: string;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    adminId: { type: String, required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String, default: '' },
    details: { type: String, required: true },
    amount: { type: Number },
    timestamp: { type: String, default: () => new Date().toISOString(), index: true },
    ip: { type: String, default: '' }
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

const MongooseAuditLog: Model<IAuditLog> =
  (mongoose.models.AuditLog as any) || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export const AuditLog: Model<IAuditLog> =
  createHybridModel<IAuditLog>(MongooseAuditLog, memoryStore.auditLogs);
