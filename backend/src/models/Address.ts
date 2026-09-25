import mongoose, { Schema, Document, Types } from "mongoose";

// A saved delivery address for a customer. Deliberately kept separate from
// the lightweight `address` object already on User — that one is a simple
// profile field, this is a full set of reusable, selectable checkout
// addresses (the shape the order controller already expects).
export interface IAddress extends Document {
  user: Types.ObjectId;
  label?: string; // friendly name, e.g. "Home" / "Office" — shown in the UI only
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    label: { type: String, trim: true, default: "Address" },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    deliveryInstructions: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IAddress>("Address", AddressSchema);
