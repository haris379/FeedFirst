import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  category: Types.ObjectId;
  price: number; // price per unit
  unit: "kg" | "g" | "lb" | "pack";
  image: string;
  stock: number;
  sku: string;
  status: "active" | "disabled";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "g", "lb", "pack"], default: "kg" },
    image: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export default mongoose.model<IProduct>("Product", ProductSchema);
