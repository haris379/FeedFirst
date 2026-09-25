import { Request, Response } from "express";

import { priceCustomFeed } from "../services/pricingService";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import Cart from "../models/Cart";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await Cart.findOne({ user: req.user!.id }).populate("ingredients.product");
  if (!cart) {
    return res.json({ success: true, cart: null, pricing: null });
  }
  const pricing = cart.ingredients.length
    ? await priceCustomFeed(
        cart.ingredients.map((i: any) => ({ productId: String(i.product._id || i.product), quantity: i.quantity }))
      )
    : null;
  res.json({ success: true, cart, pricing });
});

export const saveCart = asyncHandler(async (req: Request, res: Response) => {
  const { birdType, ingredients, specialInstructions } = req.body;
  if (!Array.isArray(ingredients)) throw new ApiError(400, "Ingredients must be an array");

  // Validate against real product data before saving (never trust client totals).
  const pricing = ingredients.length
    ? await priceCustomFeed(ingredients.map((i: any) => ({ productId: i.product, quantity: i.quantity })))
    : null;

  const cart = await Cart.findOneAndUpdate(
    { user: req.user!.id },
    { user: req.user!.id, birdType, ingredients, specialInstructions },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, cart, pricing });
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  await Cart.findOneAndDelete({ user: req.user!.id });
  res.json({ success: true, message: "Cart cleared" });
});
