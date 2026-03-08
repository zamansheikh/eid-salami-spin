import mongoose, { Schema, Document } from 'mongoose';

export interface IClaim extends Document {
  claimId: string;
  sessionId: string;
  amount: number;
  name: string;
  claimedAt: Date;
  slotIndex: number;
}

const ClaimSchema = new Schema<IClaim>({
  claimId: { type: String, required: true, unique: true, index: true },
  sessionId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  claimedAt: { type: Date, default: Date.now },
  slotIndex: { type: Number, required: true },
});

export default mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
