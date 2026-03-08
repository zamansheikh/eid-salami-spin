import { Schema, model, models, type InferSchemaType } from "mongoose";

const claimSummarySchema = new Schema(
  {
    claimId: { type: String, required: true },
    recipientName: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    claimedAt: { type: Date, required: true },
  },
  { _id: false }
);

const sessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    organizerName: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 1 },
    peopleCount: { type: Number, required: true, min: 1 },
    remainingAmount: { type: Number, required: true, min: 0 },
    remainingSlots: { type: Number, required: true, min: 0 },
    pendingAmounts: {
      type: [Number],
      required: true,
      validate: {
        validator: (values: number[]) => values.every((value) => value > 0),
        message: "All pending amounts must be positive numbers.",
      },
    },
    claims: { type: [claimSummarySchema], default: [] },
  },
  { timestamps: true }
);

export type SessionDocument = InferSchemaType<typeof sessionSchema>;

export const SessionModel =
  models.Session || model("Session", sessionSchema, "sessions");
