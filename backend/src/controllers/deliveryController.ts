import { Request, Response } from "express";

import { asyncHandler } from "../middleware/errorHandler";
import DeliverySettings from "../models/DeliverySettings";

export const getDeliverySettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await DeliverySettings.findOne().sort({ createdAt: -1 });
  if (!settings) {
    settings = await DeliverySettings.create({});
  }
  res.json({ success: true, settings });
});

export const updateDeliverySettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await DeliverySettings.findOne().sort({ createdAt: -1 });
  if (!settings) {
    settings = await DeliverySettings.create(req.body);
  } else {
    settings.set(req.body);
    await settings.save();
  }
  // Note: this only affects future orders — every existing Order document
  // already stores its own deliveryFee/total snapshot, so past orders are untouched.
  res.json({ success: true, settings });
});
