import { Router } from "express";

import { getCart, saveCart, clearCart } from "../controllers/cartController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);
router.get("/", getCart);
router.post("/", saveCart);
router.delete("/", clearCart);

export default router;
