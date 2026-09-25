import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import HeroImage from "../images/HeroImage.png";
import type { Product } from "../types";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const features = [
  {
    icon: "🌿",
    title: "Natural Ingredients",
    desc: "Every ingredient is sourced fresh and stored properly — no fillers, no shortcuts.",
  },
  {
    icon: "⚖️",
    title: "Priced by Weight",
    desc: "You only pay for exactly what you choose, down to the kilogram.",
  },
  {
    icon: "🐦",
    title: "Built for Your Bird",
    desc: "Parrots, canaries, finches, budgies — every mix is made around your bird's needs.",
  },
];

const steps = [
  {
    step: "1",
    title: "Pick Your Bird Type",
    desc: "Tell us what you're feeding so we can guide your ingredient choices.",
  },
  {
    step: "2",
    title: "Choose Ingredients & Quantities",
    desc: "Mix seeds, grains, and nuts in the exact ratios you want.",
  },
  {
    step: "3",
    title: "Review & Checkout",
    desc: "See your live price and delivery charge, then place your order.",
  },
];

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const { addOrUpdateIngredient } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};

    api
      .get("/products", { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-b from-(--color-cream) to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-forest)] leading-tight">
              Custom Bird Feed Made for Your Birds
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Create the perfect feed mix based on your birds' needs — chosen
              ingredient by ingredient, priced fairly, delivered to your door.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/customize"
                className="px-6 py-3 rounded-full bg-[var(--color-forest)] text-white font-semibold hover:bg-[var(--color-forest-dark)] transition-colors"
              >
                Customize Your Feed
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3 rounded-full border-2 border-[var(--color-forest)] text-[var(--color-forest)] font-semibold hover:bg-[var(--color-forest)]/5 transition-colors"
              >
                Shop Ingredients
              </Link>
            </div>
          </div>
          <img
            src={HeroImage}
            className="rounded-3xl bg-[var(--color-leaf)]/15 aspect-square flex items-center justify-center text-8xl mx-auto md:mx-0"
            alt="HeroImage"
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-[var(--color-forest)] mb-10">
          Why Choose BirdFeast
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 text-center"
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-[var(--color-forest)] mb-10">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-forest)] text-white flex items-center justify-center font-bold mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
                      showToast(
                        `${p.name} added to your custom feed`,
                        "success",
                      );
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
      </section>
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-[var(--color-forest)] mb-10">
          Popular Ingredients
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {popularIngredients.map((i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full bg-[var(--color-seed)]/10 text-[var(--color-seed)] font-medium text-sm border border-[var(--color-seed)]/30"
            >
              {i}
            </span>
          ))}
        </div>
      </section> */}

      <section className="bg-[var(--color-forest)] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Ready to mix the perfect feed?
          </h2>
          <p className="text-white/80 mb-6">
            It takes less than five minutes to build a custom order.
          </p>
          <Link
            to="/customize"
            className="inline-block px-6 py-3 rounded-full bg-white text-[var(--color-forest)] font-semibold hover:bg-white/90 transition-colors"
          >
            Start Customizing
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
