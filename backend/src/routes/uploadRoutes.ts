import { Router } from "express";

import { uploadProductImage } from "../controllers/uploadController";
import { protect, adminOnly } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";

const router = Router();

router.post("/product-image", protect, adminOnly, uploadImage.single("image"), uploadProductImage);

export default router;