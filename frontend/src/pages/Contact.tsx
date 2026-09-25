import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "../context/ToastContext";
import api from "../services/api";

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const Contact = () => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    try {
      const res = await api.post("/contact", data);
      showToast(res.data.message, "success");
      reset();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-[var(--color-forest)] mb-6">
        Contact Us
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-black/5 p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-gray-600">Name</label>
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
            {...register("email", {
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            })}
            type="email"
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">
              Enter a valid email address
            </p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-600">Message</label>
          <textarea
            {...register("message", { required: true, minLength: 10 })}
            rows={4}
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1">
              {errors.message.type === "minLength"
                ? "Message must be at least 10 characters"
                : "Message is required"}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default Contact;
