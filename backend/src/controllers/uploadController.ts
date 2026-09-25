import { Request, Response } from "express";

import { asyncHandler, ApiError } from "../middleware/errorHandler";

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, "No image file was uploaded");
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, imageUrl });
});