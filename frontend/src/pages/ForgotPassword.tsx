import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import { Eye, EyeOff } from "lucide-react";

type Step = "email" | "otp" | "reset";

interface EmailForm {
  email: string;
}
interface OtpForm {
  otp: string;
}
interface ResetForm {
  newPassword: string;
  confirmPassword: string;
}

const RESEND_COOLDOWN = 60;

const ForgotPassword = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  const emailForm = useForm<EmailForm>();
  const otpForm = useForm<OtpForm>();
  const resetForm = useForm<ResetForm>();

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const sendOtp = async (data: EmailForm) => {
    setSubmitting(true);
    try {
      const res = await api.post("/auth/forgot-password", {
        email: data.email,
      });
      setEmail(data.email);
      showToast(res.data.message, "success");
      setStep("otp");
      startCooldown();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    setSubmitting(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      showToast(res.data.message, "success");
      startCooldown();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async (data: OtpForm) => {
    setSubmitting(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: data.otp });
      setResetToken(res.data.resetToken);
      showToast("Code verified", "success");
      setStep("reset");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const doReset = async (data: ResetForm) => {
    if (data.newPassword !== data.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showToast("Password reset successfully. Please log in.", "success");
      navigate("/login");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-var(--color-forest) mb-6 text-center">
        {step === "email" && "Forgot Password"}
        {step === "otp" && "Enter Verification Code"}
        {step === "reset" && "Reset Password"}
      </h1>
      {step === "email" && (
        <form
          onSubmit={emailForm.handleSubmit(sendOtp)}
          className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
        >
          <p className="text-sm text-gray-500">
            Enter your account email and we'll send you a 6-digit code to reset
            your password.
          </p>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              {...emailForm.register("email", {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              })}
              type="email"
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">
                Enter a valid email address
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}
      {step === "otp" && (
        <form
          onSubmit={otpForm.handleSubmit(verifyOtp)}
          className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
        >
          <p className="text-sm text-gray-500">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-700">{email}</span>. It
            expires in 10 minutes.
          </p>
          <div>
            <label className="text-sm text-gray-600">6-digit OTP</label>
            <input
              {...otpForm.register("otp", {
                required: true,
                pattern: /^\d{6}$/,
              })}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300 tracking-widest text-center text-lg"
            />
            {otpForm.formState.errors.otp && (
              <p className="text-xs text-red-500 mt-1">
                Enter the 6-digit code
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            onClick={resendOtp}
            disabled={cooldown > 0 || submitting}
            className="w-full text-sm text-var(--color-forest) font-medium disabled:text-gray-400"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
        </form>
      )}
      {step === "reset" && (
        <form
          onSubmit={resetForm.handleSubmit(doReset)}
          className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
        >
          {/* New Password */}
          <div>
            <label className="text-sm text-gray-600">New Password</label>

            <div className="relative mt-1">
              <input
                {...resetForm.register("newPassword", {
                  required: true,
                  minLength: 6,
                })}
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {resetForm.formState.errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm text-gray-600">Confirm Password</label>

            <div className="relative mt-1">
              <input
                {...resetForm.register("confirmPassword", {
                  required: true,
                  minLength: 6,
                })}
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {resetForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Please confirm your new password
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        Remembered your password?{" "}
        <Link to="/login" className="text-var(--color-forest) font-semibold">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
