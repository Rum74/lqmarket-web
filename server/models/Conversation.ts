import mongoose, { Schema, Model } from 'mongoose';
import { memoryStore, createHybridModel } from '../config/memoryStore';

export interface IMessage {
  id: string;
  orderId?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  timestamp: string;
}

export interface IConversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  messages: IMessage[];
  createdAt: string;
  updatedAt: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    orderId: { type: String },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    recipientId: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    participants: { type: [String], required: true, index: true },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: String, default: () => new Date().toISOString() },
    messages: { type: [MessageSchema], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
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

const MongooseConversation: Model<IConversation> = (mongoose.models.Conversation as any) || mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Conversation: Model<IConversation> = createHybridModel<IConversation>(MongooseConversation, memoryStore.conversations);
