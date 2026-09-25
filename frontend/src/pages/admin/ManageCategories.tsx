import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import type { Category } from "../../types";

const ManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/categories", { name, description });
      setName("");
      setDescription("");
      showToast("Category added", "success");
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    await api.put(`/categories/${c._id}`, { isActive: !c.isActive });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast("Category deleted", "success");
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manage Categories
      </h1>

      <div className="bg-white rounded-2xl border border-black/5 p-5 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300"
        />
        <button
          onClick={addCategory}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[var(--color-forest)] text-white font-semibold disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5">
          {categories.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-sm text-gray-500">{c.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(c)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                >
                  {c.isActive ? "Active" : "Disabled"}
                </button>
                <button
                  onClick={() => remove(c._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCategories;
