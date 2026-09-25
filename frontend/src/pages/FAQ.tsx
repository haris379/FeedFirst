import { useState } from "react";

const faqs = [
  {
    q: "Why is there a delivery advance?",
    a: "Because every feed mix is made to order specifically for you, we collect part of the delivery fee in advance so we can prepare and dispatch it right away.",
  },
  {
    q: "Can I change ingredients after ordering?",
    a: "Once an order is placed, the mix is locked in for preparation. Contact us as soon as possible if you need to make a change.",
  },
  {
    q: "How is the price calculated?",
    a: "Each ingredient is priced per kilogram (or its listed unit). Your total is the sum of ingredient costs plus the delivery fee, calculated automatically as you build your mix.",
  },
  {
    q: "Do you deliver outside Lahore?",
    a: "Yes — delivery fees vary by city and are shown clearly at checkout.",
  },
  {
    q: "What payment methods are supported?",
    a: "JazzCash, Easypaisa, bank transfer, card, and cash on delivery.",
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-var(--color-forest) mb-8">
        Frequently Asked Questions
      </h1>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-black/5 overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-5 py-4 font-medium text-gray-800 flex justify-between items-center"
            >
              {f.q}
              <span className="text-gray-400">{open === i ? "−" : "+"}</span>
            </button>
            {open === i && (
              <p className="px-5 pb-4 text-sm text-gray-600">{f.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
