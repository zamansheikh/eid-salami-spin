import { Schema, model, models, type InferSchemaType } from "mongoose";

const claimSchema = new Schema(
  {
    claimId: { type: String, required: true, unique: true, index: true },
    claimToken: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    organizerName: { type: String, required: true },
    recipientName: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentRequest: {
      method: { type: String, enum: ["bkash", "nagad", "rocket"] },
      number: { type: String },
      requestedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export type ClaimDocument = InferSchemaType<typeof claimSchema>;

export const ClaimModel = models.Claim || model("Claim", claimSchema, "claims");
