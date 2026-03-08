import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  creatorName: string;
  totalAmount: number;
  peopleCount: number;
  amounts: number[];
  claimedCount: number;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  creatorName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  peopleCount: { type: Number, required: true },
  amounts: [{ type: Number }],
  claimedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
