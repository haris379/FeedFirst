import { Router } from "express";

import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/productController";
import { protect, adminOnly, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, getProducts);
router.get("/:id", getProduct);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
