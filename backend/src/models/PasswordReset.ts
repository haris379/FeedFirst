import mongoose, { Schema, Document, Types } from "mongoose";

// One active OTP/reset flow per user. Each new "forgot password" request
// overwrites the previous document for that user (via findOneAndUpdate
// upsert in the controller), which naturally resets attempt counts and
// invalidates any older OTP/reset token.
export interface IPasswordReset extends Document {
  user: Types.ObjectId;
  otpHash: string;
  otpExpiresAt: Date;
  attempts: number;
  verified: boolean; // set true once the correct OTP has been entered
  resetTokenHash?: string; // short-lived token issued after OTP verification
  resetTokenExpiresAt?: Date;
  lastSentAt: Date; // used to throttle resend requests
  expireAt: Date; // TTL field — Mongo auto-deletes the doc after this time
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    resetTokenHash: { type: String },
    resetTokenExpiresAt: { type: Date },
    lastSentAt: { type: Date, required: true },
    expireAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically deletes the document once expireAt passes,
// so stale OTP/reset-token records don't linger in the database.
PasswordResetSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);