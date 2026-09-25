import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const AdminProfile = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/auth/me", { name });
      showToast("Profile updated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h1>
      <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            value={user?.email}
            disabled
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 px-4 py-2.5 rounded-lg border border-gray-300"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[var(--color-forest)] text-white font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
