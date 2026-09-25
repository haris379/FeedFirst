import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import type { Product, Category } from "../types";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { addOrUpdateIngredient } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.categories);
    });
  }, []);

  useEffect(() => {
    setLoading(true);

    const params: Record<string, string> = {};

    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-forest)]">
          Shop Bird Feed Ingredients
        </h1>

        <p className="text-gray-500 mt-2">
          Browse individual ingredients, priced per kilogram.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ingredients..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] transition"
        />

        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)] focus:border-[var(--color-forest)] transition sm:min-w-[200px]"
        >
          <option value="">All Categories</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      {loading ? (
        <Loading label="Loading ingredients..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No ingredients found"
          subtitle="Try a different search or category."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              className="group bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="aspect-video bg-[var(--color-leaf)]/10 flex items-center justify-center text-4xl overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <span>🌾</span>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4 flex flex-col flex-1">
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1 min-h-[1.5rem]">
                    {p.name}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 min-h-[2.5rem]">
                    {p.description}
                  </p>
                </div>

                {/* Price & Stock */}
                <div className="mt-4 flex items-center justify-between gap-2 min-h-[2rem]">
                  <span className="font-bold text-[var(--color-forest)]">
                    Rs {p.price} / {p.unit}
                  </span>

                  {p.stock <= 0 && (
                    <span className="text-xs text-red-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Add Button */}
                <button
                  disabled={p.stock <= 0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    addOrUpdateIngredient(p, 1);
                    showToast(`${p.name} added to your custom feed`, "success");
                  }}
                  className="mt-auto pt-4 w-full"
                >
                  <span
                    className={`block w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${
                      p.stock <= 0
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest-dark)]"
                    }`}
                  >
                    {p.stock <= 0 ? "Out of Stock" : "Add to Custom Feed"}
                  </span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
