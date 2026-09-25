import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";
import { passwordValidationRules } from "../utils/passwordValidation";

interface SignupForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const Signup = () => {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password, data.phone);
      showToast("Account created!", "success");
      navigate("/");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-[var(--color-forest)] mb-6 text-center">
        Create Account
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input
            {...register("name", { required: true })}
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">Name is required</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            {...register("email", { required: true })}
            type="email"
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">Email is required</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input
            {...register("phone")}
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Password</label>
          <div className="relative mt-1">
            <input
              {...register("password", passwordValidationRules)}
              type={!showPassword ? "text" : "password"}
              className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--color-forest)] font-semibold">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default Signup;
