import { Router } from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contactController";

const router = Router();

// Same style of extra, tighter limiter as authRoutes' otpRequestLimiter —
// prevents the contact form being used to spam the configured inbox.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent. Please try again later.",
  },
});

router.post("/", contactLimiter, submitContact);

export default router;
