
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import EmptyState from "../components/EmptyState";
import type { PricingResult } from "../types";

const Cart = () => {
  const {
    birdType,
    lines,
    removeIngredient,
    addOrUpdateIngredient,
    clearCart,
  } = useCart();

  const [pricing, setPricing] = useState<PricingResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (lines.length === 0) {
      setPricing(null);
      return;
    }

    api
      .post("/orders/quote", {
        ingredients: lines.map((l) => ({
          productId: l.product._id,
          quantity: l.quantity,
        })),
      })
      .then((res) => setPricing(res.data.pricing));
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <EmptyState
          title="Your cart is empty"
          subtitle="Start by customizing a feed mix."
        />

        <div className="text-center mt-4">
          <Link
            to="/customize"
            className="text-[var(--color-forest)] dark:text-[var(--color-leaf)] font-semibold hover:underline"
          >
            Customize Your Feed →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-3xl font-bold text-[var(--color-forest)] dark:text-[var(--color-leaf)] mb-6">
        Your Cart
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Bird type:{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-200">
          {birdType || "Not set"}
        </span>
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/10 divide-y divide-black/5 dark:divide-white/10 shadow-sm dark:shadow-black/20 transition-colors duration-300">
        {lines.map((l) => (
          <div
            key={l.product._id}
            className="flex items-center justify-between p-4"
          >
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {l.product.name}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rs {l.product.price} / {l.product.unit}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={l.quantity}
                onChange={(e) =>
                  addOrUpdateIngredient(
                    l.product,
                    Number(e.target.value),
                  )
                }
                className="w-20 text-center px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-leaf)]/50"
              />

              <span className="text-sm text-gray-500 dark:text-gray-400">
                {l.product.unit}
              </span>

              <button
                onClick={() => removeIngredient(l.product._id)}
                className="text-red-500 dark:text-red-400 hover:underline text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {pricing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/10 p-6 mt-6 max-w-sm ml-auto space-y-1.5 text-sm shadow-sm dark:shadow-black/20 transition-colors duration-300">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span>
            <span>Rs {pricing.subtotal}</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Delivery Fee</span>
            <span>Rs {pricing.deliveryFee}</span>
          </div>

          <div className="flex justify-between font-bold text-gray-800 dark:text-gray-100 text-base pt-2 border-t border-black/5 dark:border-white/10">
            <span>Grand Total</span>
            <span>Rs {pricing.total}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={clearCart}
          className="text-sm text-red-500 dark:text-red-400 hover:underline"
        >
          Clear Cart
        </button>

        <div className="flex gap-3">
          <Link
            to="/customize"
            className="px-5 py-2.5 rounded-full border border-[var(--color-forest)] dark:border-[var(--color-leaf)] text-[var(--color-forest)] dark:text-[var(--color-leaf)] font-semibold hover:bg-[var(--color-forest)]/5 dark:hover:bg-white/5 transition-colors"
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