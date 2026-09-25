import { Request, Response } from "express";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { sendContactEmail } from "../services/emailService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContact = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      throw new ApiError(400, "Name, email, and message are required");
    }
    if (!EMAIL_PATTERN.test(String(email))) {
      throw new ApiError(400, "Enter a valid email address");
    }
    if (String(message).trim().length < 10) {
      throw new ApiError(400, "Message must be at least 10 characters");
    }

    try {
      await sendContactEmail({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        message: String(message).trim(),
      });
    } catch (err) {
      // Same pattern as forgotPassword: don't leak mail-provider errors to the
      // client, log server-side only.
      console.error("Failed to send contact email:", err);
      throw new ApiError(
        500,
        "Could not send your message. Please try again shortly.",
      );
    }

    res.json({
      success: true,
      message: "Message sent! We'll get back to you soon.",
    });
  },
);
