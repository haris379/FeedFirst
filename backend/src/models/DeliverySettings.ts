import mongoose, { Schema, Document } from "mongoose";

// Business rule (as specified by the business owner):
// - Orders under the weight threshold pay the FULL delivery charge.
// - Orders at/over the weight threshold pay HALF the delivery charge,
//   and that half amount must be collected in advance at checkout
//   (because the feed is customized and made to order).
export interface IDeliverySettings extends Document {
  baseDeliveryFee: number;
  weightThresholdKg: number; // orders >= this weight get the half-fee/advance rule
  freeDeliveryThresholdKg?: number; // optional: fully free delivery above this weight
  cityFees: { city: string; fee: number }[];
  minimumOrderAmount: number;
  updatedAt: Date;
}

const DeliverySettingsSchema = new Schema<IDeliverySettings>(
  {
    baseDeliveryFee: { type: Number, required: true, default: 200 },
    weightThresholdKg: { type: Number, required: true, default: 3 },
    freeDeliveryThresholdKg: { type: Number },
    cityFees: [
      {
        city: { type: String, required: true },
        fee: { type: Number, required: true },
      },
    ],
    minimumOrderAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDeliverySettings>("DeliverySettings", DeliverySettingsSchema);
