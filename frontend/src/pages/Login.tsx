import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Eye, EyeOff } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      showToast(`Welcome back, ${user.name}!`, "success");
      const from = (location.state as any)?.from;
      navigate(from || (user.role === "admin" ? "/admin" : "/"));
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-[var(--color-forest)] mb-6 text-center">
        Log In
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
      >
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
          <label className="text-sm text-gray-600">Password</label>
          <div className="relative mt-1">
            <input
              {...register("password", { required: true })}
              type={!showPassword ? "text" : "password"}
              className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
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
            <p className="text-xs text-red-500 mt-1">Password is required</p>
          )}
          <div className="text-right mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--color-forest)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log In"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Don't have an account?{" "}
        <Link to="/signup" className="text-[var(--color-forest)] font-semibold">
          Sign Up
        </Link>
      </p>
      <p className="text-center text-xs text-gray-400 mt-6">
        Demo: admin@birdfeast.com / Admin@123 · customer@birdfeast.com /
        Customer@123
      </p>
    </div>
  );
};

export default Login;
