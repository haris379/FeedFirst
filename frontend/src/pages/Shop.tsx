import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import type { Product, Category } from "../types";

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-(--color-forest) mb-2">
        Shop Bird Feed Ingredients
      </h1>
      <p className="text-gray-500 mb-8">
        Browse individual ingredients, priced per kilogram.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ingredients..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-(--color-forest)"
        />
        <select
          value={activeCategory}
          onChange={(e) => setActiveCategory(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-(--color-forest)"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

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
              className="bg-white rounded-2xl border border-black/5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-var(--color-leaf)/10 flex items-center justify-center text-4xl overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  "🌾"
                )}
              </div>{" "}
              <div className=" "></div>
              <div className="p-4 flex flex-col justify-between ">
                <div className="">
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {p.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-(--color-forest)">
                    Rs {p.price} / {p.unit}
                  </span>
                  {p.stock <= 0 && (
                    <span className="text-xs text-red-600 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
