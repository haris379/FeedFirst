import { Router } from "express";

import { quotePrice, createOrder, getMyOrders, getOrder, confirmTestPayment, cancelMyOrder } from "../controllers/orderController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/quote", quotePrice); // public price preview for the feed builder
router.use(protect);
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getOrder);
router.post("/:id/cancel", cancelMyOrder);
router.post("/:id/pay-test", confirmTestPayment);

export default router;
