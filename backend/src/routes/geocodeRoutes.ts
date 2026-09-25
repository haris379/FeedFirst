import { Router } from "express";
import rateLimit from "express-rate-limit";
import { reverseGeocodeHandler } from "../controllers/geocodeController";
import { protect } from "../middleware/auth";

const router = Router();

// Gentle rate limit — reverse geocoding calls a free third-party service
// (Nominatim), so this keeps usage polite and prevents accidental abuse
// from a runaway frontend retry loop.
const geocodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many location lookups. Please try again shortly." },
});

router.get("/reverse", protect, geocodeLimiter, reverseGeocodeHandler);

export default router;