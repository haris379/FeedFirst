import { Request, Response } from "express";
import { put } from "@vercel/blob";

import { asyncHandler, ApiError } from "../middleware/errorHandler";

export const uploadProductImage = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, "No image file was uploaded");
    }

    const ext = req.file.originalname.split(".").pop();
    const filename = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;

    const blob = await put(filename, req.file.buffer, {
      access: "public",
      contentType: req.file.mimetype,
    });

    res.status(201).json({ success: true, imageUrl: blob.url });
  },
);
