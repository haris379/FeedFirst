import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import type { Product, PricingResult } from "../types";

const birdTypes = [
  "Parrot",
  "Pigeon",
  "Canary",
  "Finch",
  "Budgie",
  "Lovebird",
  "Other",
];

const CustomizeFeed = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const {
    birdType,
    setBirdType,
    lines,
    addOrUpdateIngredient,
    removeIngredient,
    specialInstructions,
    setSpecialInstructions,
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (lines.length === 0) {
      setPricing(null);
      setPricingError(null);
      return;
    }
    setPricingLoading(true);
    const timeout = setTimeout(() => {
      api
        .post("/orders/quote", {
          ingredients: lines.map((l) => ({
            productId: l.product._id,
            quantity: l.quantity,
          })),
        })
        .then((res) => {
          setPricing(res.data.pricing);
          setPricingError(null);
        })
        .catch((err) => {
          setPricing(null);
          setPricingError(err.message); // show the backend's real reason, e.g. "Not enough stock for \"Soft Food\""
        })
        .finally(() => setPricingLoading(false));
    }, 350); // debounce so we don't hammer the API on every keystroke
    return () => clearTimeout(timeout);
  }, [lines]);

  const getQty = (productId: string) =>
    lines.find((l) => l.product._id === productId)?.quantity || 0;

  // New
  const handleQuantityChange = (product: Product, value: number) => {
    if (Number.isNaN(value) || value < 0) return;

    if (value > product.stock) {
      showToast(
        `Only ${product.stock} ${product.unit} of ${product.name} is available`,
        "error",
      );
      addOrUpdateIngredient(product, product.stock);
      return;
    }

    addOrUpdateIngredient(product, Number(value.toFixed(2)));
  };

  if (loading) return <Loading label="Loading ingredients..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-var(--color-forest) mb-2">
          Customize Your Feed
        </h1>
        <p className="text-gray-500 mb-6">
          Pick ingredients and quantities to build a mix suited to your bird.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bird Type
          </label>
          <div className="flex flex-wrap gap-2">
            {birdTypes.map((b) => (
              <button
                key={b}
                onClick={() => setBirdType(b)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  birdType === b
                    ? "bg-[var(--color-forest)] text-white border-var(--color-forest)"
                    : "border-gray-300 text-gray-600 hover:border-var(--color-forest)"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {products.map((p) => {
            const qty = getQty(p._id);
            const outOfStock = p.stock <= 0;
            const remainingStock = Math.max(0, p.stock - qty); // New
            const limitedStock =
              !outOfStock && remainingStock <= p.stock * 0.25; // New
            return (
              <div
                key={p._id}
                className={`flex items-center justify-between bg-white rounded-xl border p-4 ${
                  outOfStock ? "border-red-100 bg-red-50/40" : "border-black/5"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-[var(--color-leaf)]/5"
                    />
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    {outOfStock && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  {/* <p
                    className={`text-sm mt-0.5 ${outOfStock ? "text-red-600 font-medium" : "text-gray-500"}`}
                  >
                    Rs {p.price} / {p.unit} ·{" "}
                    {outOfStock
                      ? "Currently unavailable"
                      : `${p.stock} ${p.unit} in stock`}
                  </p> */}
                  <p
                    className={`text-sm mt-0.5 ${
                      outOfStock
                        ? "text-red-600 font-medium"
                        : limitedStock
                          ? "text-orange-600 font-medium"
                          : "text-gray-500"
                    }`}
                  >
                    Rs {p.price} / {p.unit} ·{" "}
                    {outOfStock
                      ? "Currently unavailable"
                      : limitedStock
                        ? `Only ${remainingStock} ${p.unit} left`
                        : `${p.stock} ${p.unit} in stock`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      addOrUpdateIngredient(
                        p,
                        Math.max(0, Number((qty - 0.5).toFixed(2))),
                      )
                    }
                    disabled={outOfStock}
                    className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 hover:border-var(--color-forest) disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    max={p.stock} //new
                    value={qty}
                    disabled={outOfStock}
                    onChange={
                      (e) => handleQuantityChange(p, Number(e.target.value)) // new
                    }
                    className="w-16 text-center px-2 py-1 rounded-lg border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <button
                    onClick={() => {
                      if (qty >= p.stock) {
                        showToast(
                          `Only ${p.stock} ${p.unit} of ${p.name} is available`,
                          "error",
                        );
                        return;
                      }
                      addOrUpdateIngredient(p, Number((qty + 0.5).toFixed(2)));
                    }}
                    disabled={outOfStock}
                    className={`w-8 h-8 rounded-full border text-gray-600 hover:border-var(--color-forest) disabled:opacity-40 disabled:cursor-not-allowed ${
                      !outOfStock && qty >= p.stock
                        ? "border-orange-300 text-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder='e.g. "I want a high-seed mixture with less corn."'
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-var(--color-forest)"
          />
        </div>
      </div>

      <aside className="bg-white rounded-2xl border border-black/5 p-6 h-fit sticky top-24">
        <h2 className="font-bold text-lg text-gray-800 mb-4">
          Your Custom Feed
        </h2>

        {lines.length === 0 ? (
          <p className="text-sm text-gray-500">
            Select ingredients on the left to see your feed summary.
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {lines.map((l) => (
              <div
                key={l.product._id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-700">
                  {l.product.name} · {l.quantity} {l.product.unit}
                </span>
                <button
                  onClick={() => removeIngredient(l.product._id)}
                  className="text-red-500 hover:underline text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {pricingLoading && (
          <p className="text-xs text-gray-400 mb-2">Recalculating...</p>
        )}
        {pricingError && !pricingLoading && (
          <p className="text-xs text-red-600 font-medium mb-2">
            {pricingError}
          </p>
        )}
        {pricing && (
          <div className="border-t border-black/5 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Weight</span>
              <span>{pricing.totalWeightKg} kg</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Feed Price</span>
              <span>Rs {pricing.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>Rs {pricing.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-black/5">
              <span>Total</span>
              <span>Rs {pricing.total}</span>
            </div>
            <p className="text-xs text-var(--color-seed) mt-2">
              Rs {pricing.advanceRequired} delivery advance is collected at
              checkout since your feed is made to order.
            </p>
          </div>
        )}

        <button
          disabled={
            lines.length === 0 || !birdType || pricingLoading || !!pricingError
          }
          onClick={() => {
            if (!birdType) {
              showToast("Please select a bird type first", "error");
              return;
            }
            navigate("/cart");
          }}
          className="mt-6 w-full py-3 rounded-full bg-[var(--color-forest-dark)] text-white font-semibold hover:bg-[var(--color-forest-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Review in Cart
        </button>
      </aside>
    </div>
  );
};

export default CustomizeFeed;
