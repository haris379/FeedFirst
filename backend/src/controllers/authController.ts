import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { sendOtpEmail } from "../services/emailService";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import User from "../models/User";
import PasswordReset from "../models/PasswordReset";
import { validatePassword } from "../utils/passwordValidator";

const signToken = (id: string, role: string) => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id, role }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !phone || !password) {
    throw new ApiError(400, "Name, email, phone and password are required");
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new ApiError(400, passwordError);
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, "An account with this email already exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "customer",
  });
  const token = signToken(String(user._id), user.role);
  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = signToken(String(user._id), user.role);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: { name, phone, address } },
    { new: true, runValidators: true },
  );
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

const OTP_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const hashToken = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

const GENERIC_SENT_MESSAGE =
  "If an account exists for that email, a verification code has been sent.";

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });

    // Never reveal whether an email is registered — always return the same
    // generic response whether or not a matching user was found.
    if (!user) {
      return res.json({ success: true, message: GENERIC_SENT_MESSAGE });
    }

    const existing = await PasswordReset.findOne({ user: user._id });
    if (existing) {
      const secondsSinceLastSend =
        (Date.now() - existing.lastSentAt.getTime()) / 1000;
      if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
        const wait = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceLastSend);
        throw new ApiError(
          429,
          `Please wait ${wait} seconds before requesting another code`,
        );
      }
    }

    // Cryptographically secure 6-digit OTP (100000–999999).
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const now = new Date();

    // Upsert: a fresh request always replaces any previous OTP/reset state for
    // this user, which resets attempts and invalidates the old code/token.
    await PasswordReset.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        otpHash,
        otpExpiresAt: new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000),
        attempts: 0,
        verified: false,
        resetTokenHash: undefined,
        resetTokenExpiresAt: undefined,
        lastSentAt: now,
        expireAt: new Date(now.getTime() + (OTP_TTL_MINUTES + 5) * 60 * 1000),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    try {
      await sendOtpEmail(user.email, otp);
    } catch (err) {
      // Don't leak email-provider errors to the client; log server-side only.
      console.error("Failed to send OTP email:", err);
      throw new ApiError(
        500,
        "Could not send the verification email. Please try again shortly.",
      );
    }

    res.json({ success: true, message: GENERIC_SENT_MESSAGE });
  },
);

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const genericError = "Invalid or expired code";

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) throw new ApiError(400, genericError);

  const record = await PasswordReset.findOne({ user: user._id });
  if (!record || record.otpExpiresAt.getTime() < Date.now()) {
    throw new ApiError(400, genericError);
  }
  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    throw new ApiError(
      429,
      "Too many incorrect attempts. Please request a new code.",
    );
  }

  const isMatch = await bcrypt.compare(String(otp), record.otpHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_OTP_ATTEMPTS - record.attempts;
    throw new ApiError(
      400,
      remaining > 0
        ? `Incorrect code. ${remaining} attempt(s) remaining.`
        : "Too many incorrect attempts. Please request a new code.",
    );
  }

  // OTP correct — issue a short-lived, single-use reset token. From this
  // point on, reset-password trusts this token rather than the OTP again.
  const resetToken = crypto.randomBytes(32).toString("hex");
  record.verified = true;
  record.resetTokenHash = hashToken(resetToken);
  record.resetTokenExpiresAt = new Date(
    Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
  );
  record.attempts = 0;
  await record.save();

  res.json({ success: true, resetToken });
});

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, resetToken, newPassword, confirmPassword } = req.body;
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      throw new ApiError(
        400,
        "Email, reset token, and both password fields are required",
      );
    }
    if (newPassword !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      throw new ApiError(400, passwordError);
    }

    const genericError = "Invalid or expired reset request. Please start over.";

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) throw new ApiError(400, genericError);

    const record = await PasswordReset.findOne({ user: user._id });
    if (
      !record ||
      !record.verified ||
      !record.resetTokenHash ||
      !record.resetTokenExpiresAt ||
      record.resetTokenExpiresAt.getTime() < Date.now()
    ) {
      throw new ApiError(400, genericError);
    }

    const providedHash = hashToken(String(resetToken));
    if (providedHash !== record.resetTokenHash) {
      throw new ApiError(400, genericError);
    }

    // The User model's pre-save hook (see models/User.ts) hashes this with
    // bcrypt automatically — the same mechanism used for register/login.
    user.password = newPassword;
    await user.save();

    // Invalidate the OTP/reset record so it can never be reused.
    await PasswordReset.deleteOne({ _id: record._id });

    res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  },
);
