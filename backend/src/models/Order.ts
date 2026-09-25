import mongoose, { Schema, Document, Types } from "mongoose";

export interface IOrderIngredient {
  product: Types.ObjectId;
  name: string; // snapshot at time of order
  quantity: number;
  unit: string;
  pricePerUnit: number; // snapshot
  lineTotal: number;
}

export interface ICustomFeed {
  birdType: string;
  ingredients: IOrderIngredient[];
  totalWeightKg: number;
  specialInstructions?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;
  customFeed: ICustomFeed;
  deliveryAddress: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  subtotal: number;
  deliveryFee: number;
  advancePaid: number; // amount required/collected in advance
  total: number;
  paymentOption: "delivery_advance" | "full_amount";
  payment: {
    status: "pending" | "paid" | "failed" | "refunded";
    method: "cod" | "jazzcash" | "easypaisa" | "bank_transfer" | "card";
    referenceId?: string;
    amount: number;
    paidAt?: Date;
  };
  status:
    | "pending_payment"
    | "confirmed"
    | "preparing"
    | "ready_for_delivery"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  customerNotes?: string;
  adminNotes?: string;
  stockRestored: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    customFeed: {
      birdType: { type: String, required: true },
      ingredients: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 0.1 },
          unit: { type: String, required: true },
          pricePerUnit: { type: Number, required: true },
          lineTotal: { type: Number, required: true },
        },
      ],
      totalWeightKg: { type: Number, required: true },
      specialInstructions: { type: String },
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      deliveryInstructions: { type: String },
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    advancePaid: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      method: {
        type: String,
        enum: ["cod", "jazzcash", "easypaisa", "bank_transfer", "card"],
        required: true,
      },
      referenceId: { type: String },
      amount: { type: Number, default: 0 },
      paidAt: { type: Date },
    },
    status: {
      type: String,
      enum: [
        "pending_payment",
        "confirmed",
        "preparing",
        "ready_for_delivery",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending_payment",
    },
    customerNotes: { type: String },
    stockRestored: { type: Boolean, default: false, required: true },
    adminNotes: { type: String },
    paymentOption: {
      type: String,
      enum: ["delivery_advance", "full_amount"],
      default: "delivery_advance",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>("Order", OrderSchema);
