export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  phone?: string;
  address?: { street?: string; city?: string; postalCode?: string };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: Category | string;
  price: number;
  unit: "kg" | "g" | "lb" | "pack";
  image: string;
  stock: number;
  sku: string;
  status: "active" | "disabled";
  featured: boolean;
  createdAt?: string;
}

export interface Address {
  _id: string;
  label?: string;
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartIngredientInput {
  product: string; // product id
  quantity: number;
}

export interface PricingResult {
  ingredients: {
    product: string;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    lineTotal: number;
  }[];
  subtotal: number;
  totalWeightKg: number;
  deliveryFee: number;
  advanceRequired: number;
  total: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customFeed: {
    birdType: string;
    ingredients: PricingResult["ingredients"];
    totalWeightKg: number;
    specialInstructions?: string;
  };
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
  advancePaid: number;
  total: number;
  payment: {
    status: "pending" | "paid" | "failed" | "refunded";
    method: string;
    referenceId?: string;
    amount: number;
    paidAt?: string;
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
  createdAt: string;
  user?: { name: string; email: string } | string;
  paymentOption?: "delivery_advance" | "full_amount";
}
