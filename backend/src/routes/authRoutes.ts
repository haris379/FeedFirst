import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  getMe,
  updateMe,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

// Extra, tighter rate limit on top of the global /api/auth limiter (see
// server.ts) — specifically caps how often OTP emails can be requested.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

router.post("/forgot-password", otpRequestLimiter, forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
