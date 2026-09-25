import { Request, Response } from "express";

import { asyncHandler, ApiError } from "../middleware/errorHandler";
import Category from "../models/Category";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, count: categories.length, categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) throw new ApiError(400, "Category name is required");
  const category = await Category.create({ name, slug: slugify(name), description });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const update: any = { ...req.body };
  if (update.name) update.slug = slugify(update.name);
  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, message: "Category deleted" });
});
