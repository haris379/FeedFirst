import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

interface ProfileForm {
  name: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      street: user?.address?.street,
      city: user?.address?.city,
      postalCode: user?.address?.postalCode,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      await api.put("/auth/me", {
        name: data.name,
        phone: data.phone,
        address: { street: data.street, city: data.city, postalCode: data.postalCode },
      });
      showToast("Profile updated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-[var(--color-forest)] mb-6">My Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input value={user?.email} disabled className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input {...register("name")} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input {...register("phone")} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Street Address</label>
          <input {...register("street")} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">City</label>
            <input {...register("city")} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Postal Code</label>
            <input {...register("postalCode")} className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300" />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
