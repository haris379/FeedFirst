import Product from "../models/Product";
import DeliverySettings from "../models/DeliverySettings";
import { ApiError } from "../middleware/errorHandler";

interface IngredientInput {
  productId: string;
  quantity: number;
}

/**
 * Backend-authoritative pricing.
 * Never trust ingredient prices or totals sent from the frontend —
 * always look the product up in the database and recompute everything here.
 */
export const priceCustomFeed = async (ingredients: IngredientInput[], city?: string) => {
  if (!ingredients || ingredients.length === 0) {
    throw new ApiError(400, "At least one ingredient is required");
  }

  const resolvedIngredients: {
    product: string;
    name: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    lineTotal: number;
  }[] = [];

  let subtotal = 0;
  let totalWeightKg = 0;

  for (const item of ingredients) {
    if (!item.quantity || item.quantity <= 0) {
      throw new ApiError(400, "Ingredient quantity must be greater than zero");
    }
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ApiError(404, `Ingredient not found: ${item.productId}`);
    }
    if (product.status !== "active") {
      throw new ApiError(400, `Ingredient "${product.name}" is currently unavailable`);
    }
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Not enough stock for "${product.name}"`);
    }

    const lineTotal = Number((product.price * item.quantity).toFixed(2));
    subtotal += lineTotal;

    // normalize weight to kg for delivery-fee calculation
    let weightKg = item.quantity;
    if (product.unit === "g") weightKg = item.quantity / 1000;
    if (product.unit === "lb") weightKg = item.quantity * 0.4536;
    if (product.unit === "pack") weightKg = 0; // packs don't count toward weight-based delivery
    totalWeightKg += weightKg;

    resolvedIngredients.push({
      product: String(product._id),
      name: product.name,
      quantity: item.quantity,
      unit: product.unit,
      pricePerUnit: product.price,
      lineTotal,
    });
  }

  subtotal = Number(subtotal.toFixed(2));
  totalWeightKg = Number(totalWeightKg.toFixed(2));

  const settings = await DeliverySettings.findOne().sort({ createdAt: -1 });
  const base = settings?.baseDeliveryFee ?? 200;
  const threshold = settings?.weightThresholdKg ?? 3;

  let cityFee = 0;
  if (city && settings?.cityFees?.length) {
    const match = settings.cityFees.find((c) => c.city.toLowerCase() === city.toLowerCase());
    if (match) cityFee = match.fee;
  }
  const fullDeliveryFee = base + cityFee;

  // Business rule: orders under the weight threshold pay the full delivery
  // fee; orders at/over the threshold pay HALF the delivery fee, and that
  // half must be collected as an advance payment at checkout (the feed is
  // made to order, so the advance is taken up front).
  let deliveryFee: number;
  let advanceRequired: number;
  if (totalWeightKg >= threshold) {
    deliveryFee = Number((fullDeliveryFee / 2).toFixed(2));
    advanceRequired = deliveryFee; // the half fee itself is the advance
  } else {
    deliveryFee = fullDeliveryFee;
    advanceRequired = 0; // under-threshold orders pay delivery on receipt
  }

  if (settings?.freeDeliveryThresholdKg && totalWeightKg >= settings.freeDeliveryThresholdKg) {
    deliveryFee = 0;
    advanceRequired = 0;
  }

  const total = Number((subtotal + deliveryFee).toFixed(2));

  return {
    ingredients: resolvedIngredients,
    subtotal,
    totalWeightKg,
    deliveryFee,
    advanceRequired,
    total,
  };
};
