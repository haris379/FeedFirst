import { Router } from "express";

import { getDashboardStats, getAllOrders, updateOrderStatus, getAllCustomers } from "../controllers/adminController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.use(protect, adminOnly);
router.get("/dashboard", getDashboardStats);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllCustomers);

export default router;
