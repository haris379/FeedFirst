import { Router } from "express";

import { getDeliverySettings, updateDeliverySettings } from "../controllers/deliveryController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

router.get("/settings", getDeliverySettings);
router.put("/settings", protect, adminOnly, updateDeliverySettings);

export default router;
