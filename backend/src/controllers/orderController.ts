import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { priceCustomFeed } from "../services/pricingService";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const generateOrderNumber = () => {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `BF-${ts}-${rand}`;
};

// Public price preview — used by the "Customize Your Feed" page before checkout.
// Purely informational; the order endpoint below recalculates everything again
// from the database at the moment the order is actually placed.
export const quotePrice = asyncHandler(async (req: Request, res: Response) => {
  const { ingredients, city } = req.body;
  const pricing = await priceCustomFeed(ingredients || [], city);
  res.json({ success: true, pricing });
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    birdType,
    ingredients,
    specialInstructions,
    deliveryAddress,
    paymentMethod,
    paymentOption = "delivery_advance",
    customerNotes,
  } = req.body;
  if (!birdType || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new ApiError(
      400,
      "Bird type and at least one ingredient are required",
    );
  }
  if (
    !deliveryAddress ||
    !deliveryAddress.fullName ||
    !deliveryAddress.phone ||
    !deliveryAddress.street ||
    !deliveryAddress.city
  ) {
    throw new ApiError(400, "Complete delivery address is required");
  }
  if (!paymentMethod) {
    throw new ApiError(400, "Payment method is required");
  }

  // Recalculate everything server-side. Never trust prices/totals from the client.
  const pricing = await priceCustomFeed(
    ingredients.map((i: any) => ({
      productId: i.product,
      quantity: i.quantity,
    })),
    deliveryAddress.city,
  );

  if (!["delivery_advance", "full_amount"].includes(paymentOption)) {
    throw new ApiError(
      400,
      "Invalid payment option. Choose delivery advance or full payment.",
    );
  }

  // Atomically reserve each ingredient. If any reservation/order creation fails,
  // release every reservation already made.
  const reserved: { product: string; quantity: number }[] = [];
  try {
    for (const item of pricing.ingredients) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, status: "active", stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true },
      );
      if (!updated)
        throw new ApiError(
          409,
          `Insufficient stock for "${item.name}". Please refresh your cart.`,
        );
      reserved.push({ product: item.product, quantity: item.quantity });
    }
  } catch (error) {
    await Promise.all(
      reserved.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        }),
      ),
    );
    throw error;
  }

  let order;
  try {
    order = await Order.create({
      user: req.user!.id,
      orderNumber: generateOrderNumber(),
      customFeed: {
        birdType,
        ingredients: pricing.ingredients,
        totalWeightKg: pricing.totalWeightKg,
        specialInstructions,
      },
      deliveryAddress,
      subtotal: pricing.subtotal,
      deliveryFee: pricing.deliveryFee,
      advancePaid: 0, // set to advanceRequired only once the dev/test payment step confirms it
      total: pricing.total,

      paymentOption,

      payment: {
        status:
          paymentOption === "delivery_advance" && pricing.advanceRequired === 0
            ? "paid" // nothing was owed upfront, so there's nothing left pending
            : "pending",
        method: paymentMethod,
        amount:
          paymentOption === "full_amount"
            ? pricing.total
            : pricing.advanceRequired,
      },
      status:
        paymentOption === "delivery_advance" && pricing.advanceRequired === 0
          ? "confirmed"
          : "pending_payment",
      customerNotes,
    });
  } catch (error) {
    await Promise.all(
      reserved.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        }),
      ),
    );
    throw error;
  }

  res
    .status(201)
    .json({ success: true, order, advanceRequired: pricing.advanceRequired });
});

export const cancelMyOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status !== "pending_payment" && order.status !== "confirmed") {
      throw new ApiError(
        400,
        "Only orders awaiting payment or processing can be cancelled.",
      );
    }
    if (order.payment.status === "paid")
      throw new ApiError(
        400,
        "Contact support to cancel an order that has already been paid.",
      );
    order.status = "cancelled";
    if (!order.stockRestored) {
      await Promise.all(
        order.customFeed.ingredients.map((item) =>
          Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          }),
        ),
      );
      order.stockRestored = true;
    }
    await order.save();
    res.json({
      success: true,
      order,
      message: "Order cancelled and reserved stock released.",
    });
  },
);

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, count: orders.length, orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) throw new ApiError(404, "Order not found");
  const isOwner = String(order.user._id ?? order.user) === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You can only view your own orders");
  }
  res.json({ success: true, order });
});

// --- Development/test payment confirmation ---
// This is NOT a real payment integration. It exists so the app has a
// working end-to-end flow, and is structured so a real provider (e.g.
// Stripe) can replace it later without touching the rest of the order logic.
export const confirmTestPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");
    if (String(order.user) !== req.user!.id)
      throw new ApiError(403, "Not your order");

    if (order.status === "cancelled") {
      throw new ApiError(
        400,
        "This order has been cancelled and can no longer be paid for.",
      );
    }
    if (order.payment.status === "paid") {
      throw new ApiError(
        400,
        "This order's delivery advance has already been paid.",
      );
    }

    order.payment.status = "paid";
    order.payment.referenceId = `TEST-${Date.now()}`;
    order.payment.paidAt = new Date();
    order.advancePaid = order.payment.amount;
    if (order.status === "pending_payment") order.status = "confirmed";
    await order.save();

    res.json({
      success: true,
      order,
      note: "Simulated test payment — no real transaction occurred.",
    });
  },
);
