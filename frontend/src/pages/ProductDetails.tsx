import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import type { Product } from "../types";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();

  const canGoBack = location.key !== "default";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addOrUpdateIngredient } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => showToast("Could not load this ingredient", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading label="Loading ingredient..." />;
  if (!product)
    return (
      <div className="text-center py-20 text-gray-500">
        Ingredient not found.
      </div>
    );

  const exceedsStock = quantity > product.stock;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {canGoBack ? (
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[var(--color-forest)] hover:underline"
        >
          ← Back
        </button>
      ) : (
        <Link
          to="/shop"
          className="text-sm text-[var(--color-forest)] hover:underline"
        >
          ← Back to Shop
        </Link>
      )}
      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div className="aspect-square rounded-3xl bg-[var(--color-leaf)]/10 flex items-center justify-center text-8xl overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            "🌾"
          )}
        </div>{" "}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-gray-500 mt-2">{product.description}</p>

          <div className="flex items-center gap-3 mt-4">
            <p className="text-2xl font-bold text-[var(--color-forest)]">
              Rs {product.price}{" "}
              <span className="text-base font-normal text-gray-500">
                / {product.unit}
              </span>
            </p>
            {product.stock <= 0 && (
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                Out of Stock
              </span>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${product.stock <= 0 ? "text-red-600 font-medium" : "text-gray-500"}`}
          >
            SKU: {product.sku} ·{" "}
            {product.stock <= 0
              ? "Currently unavailable"
              : `${product.stock} ${product.unit} in stock`}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              Quantity ({product.unit})
            </label>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={quantity}
              disabled={product.stock <= 0}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`w-24 px-3 py-2 rounded-lg border disabled:bg-gray-100 disabled:text-gray-400 ${
                exceedsStock
                  ? "border-red-400 focus:outline-red-400"
                  : "border-gray-300"
              }`}
            />
          </div>
          {exceedsStock && (
            <p className="text-xs text-red-600 font-medium mt-1">
              Only {product.stock} {product.unit} available — reduce the
              quantity to continue.
            </p>
          )}
          <button
            disabled={product.stock <= 0 || exceedsStock || quantity <= 0}
            onClick={() => {
              addOrUpdateIngredient(product, quantity);
              showToast(`${product.name} added to your custom feed`, "success");
              navigate("/customize");
            }}
            className="mt-6 px-6 py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {product.stock <= 0 ? "Out of Stock" : "Add to Custom Feed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
