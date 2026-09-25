import { Request, Response } from "express";
import Order from "../models/Order";
import User from "../models/User";
import Product from "../models/Product";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    const [
      totalCustomers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      revenueAgg,
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: "pending_payment" }),
      Order.countDocuments({ status: "delivered" }),
      Order.aggregate([
        { $match: { "payment.status": "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders: deliveredOrders,
        revenue: revenueAgg[0]?.total || 0,
      },
    });
  },
);

export const getAllOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, search } = req.query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) filter.orderNumber = { $regex: String(search), $options: "i" };
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  },
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, adminNotes } = req.body;
    const valid = [
      "pending_payment",
      "confirmed",
      "preparing",
      "ready_for_delivery",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if (status && !valid.includes(status))
      throw new ApiError(400, "Invalid order status");

    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    // The advance is what makes a made-to-order feed order real — an order
    // can never move past "pending_payment" (other than being cancelled)
    // until the customer's advance payment is actually marked "paid". This
    // mirrors the rule already enforced by the customer-facing pay-test
    // endpoint, so it can't be bypassed through the admin dropdown either.
    if (
      status &&
      status !== "pending_payment" &&
      status !== "cancelled" &&
      order.payment.status !== "paid"
    ) {
      throw new ApiError(
        400,
        "Delivery advance payment is required before confirming this order.",
      );
    }

    if (status === "cancelled" && order.status !== "cancelled" && !order.stockRestored) {
      await Promise.all(order.customFeed.ingredients.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })));
      order.stockRestored = true;
    }
    if (status) order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    await order.save();

    res.json({ success: true, order });
  },
);

export const getAllCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    const customers = await User.find({ role: "customer" }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: customers.length, customers });
  },
);
