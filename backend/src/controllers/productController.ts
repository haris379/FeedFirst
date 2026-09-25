import { Request, Response } from "express";

import { asyncHandler, ApiError } from "../middleware/errorHandler";
import Product from "../models/Product";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, featured, search, status } = req.query;
  const filter: Record<string, any> = {};

  // Public callers only ever see active products; admins may pass status
  // explicitly, or "all" to see both active and disabled products.
  if (req.user?.role === "admin" && status) {
    if (status !== "all") filter.status = status;
  } else {
    filter.status = "active";
  }
  if (category) filter.category = category;
  if (featured) filter.featured = featured === "true";
  if (search) {
    const regex = new RegExp(String(search).trim(), "i"); // case-insensitive partial match
    filter.$or = [{ name: regex }];
    // filter.$or = [{ name: regex }, { description: regex }];
  }

  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, products });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug",
  );
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      description,
      category,
      price,
      unit,
      image,
      stock,
      sku,
      featured,
    } = req.body;
    if (!name || !description || !category || price == null || !sku) {
      throw new ApiError(400, "Missing required product fields");
    }
    const product = await Product.create({
      name,
      description,
      category,
      price,
      unit,
      image,
      stock,
      sku,
      featured,
    });
    res.status(201).json({ success: true, product });
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(404, "Product not found");
    res.json({ success: true, product });
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(404, "Product not found");
    res.json({ success: true, message: "Product deleted" });
  },
);
