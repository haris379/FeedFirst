import { useEffect, useState } from "react";
import api from "../../services/api";
import Loading from "../../components/Loading";
import { useToast } from "../../context/ToastContext";
import type { Product, Category } from "../../types";

interface ProductFormState {
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  stock: string;
  sku: string;
  featured: boolean;
  image: string;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  category: "",
  price: "",
  unit: "kg",
  stock: "",
  sku: "",
  featured: false,
  image: "",
};

const ManageProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api
        .get("/products", { params: { status: "all" } })
        .catch(() => api.get("/products")),
      api.get("/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p.data.products);
        setCategories(c.data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?._id || "" });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      category: typeof p.category === "string" ? p.category : p.category._id,
      price: String(p.price),
      unit: p.unit,
      stock: String(p.stock),
      sku: p.sku,
      featured: p.featured,
      image: p.image || "",
    });
    setShowForm(true);
  };

  const submit = async () => {
    if (
      !form.name ||
      !form.description ||
      !form.category ||
      !form.price ||
      !form.sku
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      stock: Number(form.stock) || 0,
      sku: form.sku,
      featured: form.featured,
      image: form.image,
    };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast("Product updated", "success");
      } else {
        await api.post("/products", payload);
        showToast("Product added", "success");
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (p: Product) => {
    await api.put(`/products/${p._id}`, {
      status: p.status === "active" ? "disabled" : "active",
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      showToast("Product deleted", "success");
      load();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/uploads/product-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image: res.data.imageUrl }));
      showToast("Image uploaded", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <button
          onClick={openAdd}
          className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[var(--color-forest)] text-white font-semibold"
        >
          + Add Product
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full sm:max-w-sm mb-4 px-4 py-2.5 rounded-lg border border-gray-300"
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="hidden sm:block bg-white rounded-2xl border border-black/5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-var(--color-leaf)/5"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-leaf)]/10 flex items-center justify-center text-lg">
                          🌾
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {p.name}
                      {p.featured && (
                        <span className="ml-2 text-xs text-var(--color-seed)">
                          ★ Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.sku}</td>
                    <td className="px-4 py-3">
                      Rs {p.price}/{p.unit}
                    </td>
                    <td className="px-4 py-3">{p.stock}-kg</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-var(--color-forest) hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile product cards */}
          <div className="sm:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/5 p-6 text-center text-sm text-gray-500">
                No products found.
              </div>
            ) : (
              filtered.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-2xl border border-black/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 shrink-0 object-contain rounded-xl border border-gray-200 bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 shrink-0 rounded-xl bg-[var(--color-leaf)]/10 flex items-center justify-center text-2xl">
                        🌾
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-800 break-words">
                          {p.name}
                        </h3>
                        {p.featured && (
                          <span className="text-xs font-semibold text-[var(--color-seed)]">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-1 break-all">
                        SKU: {p.sku}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
                        <span>
                          Rs {p.price}/{p.unit}
                        </span>
                        <span>{p.stock} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        p.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {p.status}
                    </button>

                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-[var(--color-forest)] font-semibold hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="text-red-500 font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90dvh] overflow-y-auto">
            <h2 className="font-bold text-lg text-gray-800 mb-4">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  placeholder="Price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300"
                />
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="pack">pack</option>
                </select>
                <input
                  placeholder="Stock"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300"
                />
              </div>
              <input
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300"
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Product Image
                </label>

                <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-colors hover:border-[var(--color-forest)]">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Image preview */}
                    <div className="w-24 h-24 shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt="Product preview"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="text-center">
                          <span className="text-3xl">🌾</span>
                          <p className="text-xs text-gray-400 mt-1">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Upload controls */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {form.image ? "Image selected" : "Upload product image"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 mb-3">
                        Choose a clear image of your product. Supported formats:
                        JPG, PNG, WEBP.
                      </p>

                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-forest)] text-white text-sm font-semibold cursor-pointer hover:bg-[var(--color-forest-dark)] transition-colors">
                        <span>
                          {uploading ? "Uploading..." : "Choose Image"}
                        </span>

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageSelect}
                          disabled={uploading}
                          className="sr-only"
                        />
                      </label>

                      {uploading && (
                        <p className="text-xs text-[var(--color-forest)] mt-2">
                          Please wait while your image uploads...
                        </p>
                      )}

                      {!uploading && form.image && (
                        <p className="text-xs text-green-700 mt-2">
                          ✓ Image uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Featured product
              </label>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--color-forest)] text-white font-semibold disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
