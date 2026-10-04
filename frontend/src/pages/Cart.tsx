import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import EmptyState from "../components/EmptyState";

interface DeliveryRules {
  baseDeliveryFee: number;
  weightThresholdKg: number;
  freeDeliveryThresholdKg?: number;
}

const RULES_CACHE_KEY = "bf_delivery_rules";

// Last-known delivery rules, so the total can render instantly on repeat visits.
const readCachedRules = (): DeliveryRules | null => {
  try {
    const raw = sessionStorage.getItem(RULES_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Cart = () => {
  const {
    birdType,
    lines,
    removeIngredient,
    addOrUpdateIngredient,
    clearCart,
    totalWeightKg,
  } = useCart();

  const [rules, setRules] = useState<DeliveryRules | null>(readCachedRules);
  const navigate = useNavigate();

  // Delivery rules are fetched once (not on every quantity change).
  useEffect(() => {
    api
      .get("/delivery/settings")
      .then((res) => {
        setRules(res.data.settings);
        try {
          sessionStorage.setItem(
            RULES_CACHE_KEY,
            JSON.stringify(res.data.settings),
          );
        } catch {
          /* ignore storage errors */
        }
      })
      .catch(() => {
        /* keep cached rules if any */
      });
  }, []);

  // Same calculation as the backend pricingService, run on the cart data
  // already on the page so the total updates instantly.
  const pricing = useMemo(() => {
    if (lines.length === 0 || !rules) return null;

    const subtotal = Number(
      lines
        .reduce(
          (sum, l) => sum + Number((l.product.price * l.quantity).toFixed(2)),
          0,
        )
        .toFixed(2),
    );
    const weightKg = Number(totalWeightKg.toFixed(2));

    let deliveryFee = rules.baseDeliveryFee;
    if (weightKg >= rules.weightThresholdKg) {
      deliveryFee = Number((rules.baseDeliveryFee / 2).toFixed(2));
    }
    if (
      rules.freeDeliveryThresholdKg &&
      weightKg >= rules.freeDeliveryThresholdKg
    ) {
      deliveryFee = 0;
    }

    return {
      subtotal,
      deliveryFee,
      // The delivery charge is always collected in advance at checkout.
      advanceRequired: deliveryFee,
      total: Number((subtotal + deliveryFee).toFixed(2)),
    };
  }, [lines, rules, totalWeightKg]);

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-gray-800 transition-colors duration-300">
        <EmptyState
          title="Your cart is empty"
          subtitle="Start by customizing a feed mix."
        />

        <div className="text-center mt-4">
          <Link
            to="/customize"
            className="text-[var(--color-forest)] font-semibold hover:underline"
          >
            Customize Your Feed →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-800 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-[var(--color-forest)] mb-6">
        Your Cart
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        Bird type (optional):{" "}
        <span className="font-semibold text-gray-700 ">
          {birdType || "Not specified"}
        </span>
      </p>

      <div className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5 shadow-sm transition-colors duration-300">
        {lines.map((l) => (
          <div
            key={l.product._id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4"
          >
            <div>
              <p className="font-semibold text-gray-800 ">{l.product.name}</p>

              <p className="text-sm text-gray-500 ">
                Rs {l.product.price} / {l.product.unit}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={l.quantity}
                onChange={(e) =>
                  addOrUpdateIngredient(l.product, Number(e.target.value))
                }
                className="w-20 text-center px-2 py-1 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/50"
              />

              <span className="text-sm text-gray-500 ">{l.product.unit}</span>

              <button
                onClick={() => removeIngredient(l.product._id)}
                className="text-red-500 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {pricing && (
        <div className="bg-white rounded-2xl border border-black/5 p-6 mt-6 max-w-sm ml-auto space-y-1.5 text-sm shadow-sm transition-colors duration-300">
          <div className="flex justify-between text-gray-600 ">
            <span>Subtotal</span>
            <span>Rs {pricing.subtotal}</span>
          </div>

          <div className="flex justify-between text-gray-600 ">
            <span>Delivery Fee</span>
            <span>Rs {pricing.deliveryFee}</span>
          </div>

          <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-black/5 ">
            <span>Grand Total</span>
            <span>Rs {pricing.total}</span>
          </div>

          {pricing.advanceRequired > 0 && (
            <p className="text-xs text-gray-500 pt-1">
              Rs {pricing.advanceRequired} delivery advance is due at checkout.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:underline"
        >
          Clear Cart
        </button>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/customize"
            className="px-5 py-2.5 rounded-full border border-[var(--color-forest)] text-[var(--color-forest)] font-semibold hover:bg-[var(--color-forest)]/5 transition-colors"
          >
            Edit Feed
          </Link>

          <button
            onClick={() => navigate("/checkout")}
            className="px-6 py-2.5 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
