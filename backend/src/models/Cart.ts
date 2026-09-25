import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICartIngredient {
  product: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  birdType?: string;
  ingredients: ICartIngredient[];
  specialInstructions?: string;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    birdType: { type: String },
    ingredients: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 0.1 },
      },
    ],
    specialInstructions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", CartSchema);
